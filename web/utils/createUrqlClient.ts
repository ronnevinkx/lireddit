import { stringifyVariables } from '@urql/core';
import { Cache, cacheExchange, Resolver } from '@urql/exchange-graphcache';
import gql from 'graphql-tag';
import router from 'next/router';
import { dedupExchange, Exchange, fetchExchange } from 'urql';
import { pipe, tap } from 'wonka';

import {
	DeletePostMutationVariables,
	LoginMutation,
	LogoutMutation,
	MeDocument,
	MeQuery,
	RegisterMutation,
	VoteMutationVariables
} from '../__generated__/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
import { isServer } from './isServer';

// this exchange catches all errors, so we can handle errors at a global level
const errorExchange: Exchange =
	({ forward }) =>
	ops$ => {
		return pipe(
			forward(ops$),
			tap(({ error }) => {
				// if the OperationResult has an error send a request to sentry
				if (error) {
					// the error is a CombinedError with networkError and graphqlErrors properties
					// whatever error reporting you have
					if (error?.message.includes('Not authenticated')) {
						// replace instead of push; this replaces the current entry in the history
						router.replace('/login');
					}
				}
			})
		);
	};

const invalidateAllPosts = (cache: Cache) => {
	const allFields = cache.inspectFields('Query');
	const fieldInfos = allFields.filter(info => info.fieldName === 'posts');

	fieldInfos.forEach(fi => {
		cache.invalidate('Query', 'posts', fi.arguments || {});
	});
};

// exchanges: run whenever certain mutations run and then update the cache,
// specifically the MeQuery and sticking the user in there.
// we do this to update the "login state" immediately
export const createUrqlClient = (ssrExchange: any, ctx: any) => {
	let cookie = '';

	if (isServer()) {
		cookie = ctx?.req?.headers?.cookie;
	}

	return {
		url: process.env.NEXT_PUBLIC_API_URL as string,
		fetchOptions: {
			credentials: 'include' as const,
			headers: cookie ? { cookie } : undefined
		},
		exchanges: [
			dedupExchange,
			cacheExchange({
				keys: {
					PaginatedPosts: () => null
				},
				resolvers: {
					Query: {
						posts: cursorPagination()
					}
				},
				updates: {
					Mutation: {
						vote: (_result, args, cache, info) => {
							const { postId, value } =
								args as VoteMutationVariables;
							const data = cache.readFragment(
								gql`
									fragment _ on Post {
										id
										points
										voteStatus
									}
								`,
								{ id: postId } as any
							);

							if (data) {
								// trying to update voteStatus with same value? then do nothing
								if (data.voteStatus === value) {
									return;
								}

								// if we are changing our vote, do -2 or +2 to switch points correctly
								const newPoints =
									(data.points as number) +
									(!data.voteStatus ? 1 : 2) * value;

								cache.writeFragment(
									gql`
										fragment __ on Post {
											points
											voteStatus
										}
									`,
									{
										id: postId,
										points: newPoints,
										voteStatus: value
									} as any
								);
							}
						},
						createPost: (_result, args, cache, info) => {
							invalidateAllPosts(cache);

							// refetch this data
							// cache.invalidate('Query', 'posts', {
							// 	limit: 15
							// });
						},
						deletePost: (_result, args, cache, info) => {
							cache.invalidate({
								__typename: 'Post',
								id: (args as DeletePostMutationVariables).id
							});
						},
						logout: (_result, args, cache, info) => {
							betterUpdateQuery<LogoutMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								_result,
								() => ({ me: null })
							);
						},
						login: (_result, args, cache, info) => {
							betterUpdateQuery<LoginMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								_result,
								(result, query) => {
									if (result.login.errors) {
										return query;
									} else {
										return {
											me: result.login.user
										};
									}
								}
							);
							invalidateAllPosts(cache);
						},
						register: (_result, args, cache, info) => {
							betterUpdateQuery<RegisterMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								_result,
								(result, query) => {
									if (result.register.errors) {
										return query;
									} else {
										return {
											me: result.register.user
										};
									}
								}
							);
						}
					}
				}
			}),
			errorExchange,
			ssrExchange,
			fetchExchange
		]
	};
};

export type MergeMode = 'before' | 'after';

export interface PaginationParams {
	cursorArgument?: string;
	offsetArgument?: string;
	mergeMode?: MergeMode;
}

const cursorPagination = (): Resolver => {
	return (_parent, fieldArgs, cache, info) => {
		const { parentKey: entityKey, fieldName } = info;
		const allFields = cache.inspectFields(entityKey);
		const fieldInfos = allFields.filter(
			info => info.fieldName === fieldName
		);
		const size = fieldInfos.length;
		if (size === 0) {
			return undefined;
		}
		const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
		const isItInTheCache = cache.resolve(
			cache.resolve(entityKey, fieldKey) as string,
			'posts'
		);
		info.partial = !isItInTheCache;
		let hasMore = true;
		const results: string[] = [];

		// loop through cache and return it
		// so when we paginate, it will just add to previous results in cache
		fieldInfos.forEach(fi => {
			const key = cache.resolve(entityKey, fi.fieldKey) as string;
			const data = cache.resolve(key, 'posts') as string[];
			const _hasMore = cache.resolve(key, 'hasMore');

			if (!_hasMore) {
				hasMore = _hasMore as boolean;
			}

			results.push(...data);
		});

		return {
			__typename: 'PaginatedPosts',
			hasMore,
			posts: results
		};

		// const visited = new Set();
		// let result: NullArray<string> = [];
		// let prevOffset: number | null = null;

		// for (let i = 0; i < size; i++) {
		// 	const { fieldKey, arguments: args } = fieldInfos[i];
		// 	if (args === null || !compareArgs(fieldArgs, args)) {
		// 		continue;
		// 	}

		// 	const links = cache.resolve(entityKey, fieldKey) as string[];
		// 	const currentOffset = args[cursorArgument];

		// 	if (
		// 		links === null ||
		// 		links.length === 0 ||
		// 		typeof currentOffset !== 'number'
		// 	) {
		// 		continue;
		// 	}

		// 	const tempResult: NullArray<string> = [];

		// 	for (let j = 0; j < links.length; j++) {
		// 		const link = links[j];
		// 		if (visited.has(link)) continue;
		// 		tempResult.push(link);
		// 		visited.add(link);
		// 	}

		// 	if (
		// 		(!prevOffset || currentOffset > prevOffset) ===
		// 		(mergeMode === 'after')
		// 	) {
		// 		result = [...result, ...tempResult];
		// 	} else {
		// 		result = [...tempResult, ...result];
		// 	}

		// 	prevOffset = currentOffset;
		// }

		// const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
		// if (hasCurrentPage) {
		// 	return result;
		// } else if (!(info as any).store.schema) {
		// 	return undefined;
		// } else {
		// 	info.partial = true;
		// 	return result;
		// }
	};
};
