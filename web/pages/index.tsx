import { Button } from '@chakra-ui/button';
import { Box, Flex, Heading, Link, Stack, Text } from '@chakra-ui/layout';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { NextPageContext } from 'next';
import NextLink from 'next/link';

import { PostsDocument, usePostsQuery } from '../__generated__/graphql';
import EditDeletePostButtons from '../components/EditDeletePostButtons';
import { Layout } from '../components/Layout';
import { UpvoteSection } from '../components/UpvoteSection';
import { addApolloState, initializeApollo } from '../utils/apolloClient';

dayjs.extend(relativeTime);

interface IndexProps {}

const Index: React.FC<IndexProps> = () => {
	const { data, loading, fetchMore, variables } = usePostsQuery({
		variables: {
			limit: 15,
			cursor: null
		},
		notifyOnNetworkStatusChange: true
	});

	if (!loading && !data) {
		return <div>Failed to load posts.</div>;
	}

	return (
		<Layout>
			<Box>
				<Heading fontSize="lg">Latest posts</Heading>
			</Box>
			<Box mt={4}>
				{!data && loading ? (
					<div>Loading...</div>
				) : (
					<Stack spacing={8}>
						{data!.posts.posts.map(post =>
							!post ? null : (
								<Flex
									key={post.id}
									p={5}
									shadow="md"
									borderWidth="1px"
								>
									<UpvoteSection post={post} />
									<Flex flex={1} align="start">
										<Box flex={1}>
											<NextLink
												href="/post/[id]"
												as={`/post/${post.id}`}
											>
												<Link href={`/post/${post.id}`}>
													<Heading fontSize="xl">
														{post.title}
													</Heading>
												</Link>
											</NextLink>
											<Text>
												posted by{' '}
												{post.creator.username}{' '}
												{dayjs(
													parseInt(post.createdAt)
												).fromNow()}
											</Text>
											<Text flex={1} mt={4}>
												{post.textSnippet}
											</Text>
										</Box>
										<Box ml="auto">
											<EditDeletePostButtons
												id={post.id}
												prev="/"
												creatorId={post.creator.id}
											/>
										</Box>
									</Flex>
								</Flex>
							)
						)}
					</Stack>
				)}
			</Box>
			{data && data.posts.hasMore ? (
				<Flex>
					<Button
						onClick={() =>
							fetchMore({
								variables: {
									limit: variables?.limit,
									cursor: data.posts.posts[
										data.posts.posts.length - 1
									].createdAt
								}
								// updateQuery: (
								// 	previousValue,
								// 	{ fetchMoreResult }
								// ): PostsQuery => {
								// 	if (!fetchMoreResult) {
								// 		return previousValue;
								// 	}

								// 	return {
								// 		__typename: 'Query',
								// 		posts: {
								// 			__typename: 'PaginatedPosts',
								// 			hasMore: (
								// 				fetchMoreResult as PostsQuery
								// 			).posts.hasMore,
								// 			posts: [
								// 				...(previousValue as PostsQuery)
								// 					.posts.posts,
								// 				...(
								// 					fetchMoreResult as PostsQuery
								// 				).posts.posts
								// 			]
								// 		}
								// 	};
								// }
							})
						}
						isLoading={loading}
						m="auto"
						my={8}
					>
						Load More
					</Button>
				</Flex>
			) : null}
			{data && data.posts?.posts?.length === 0
				? 'No posts available.'
				: null}
		</Layout>
	);
};

// getStaticProps works and gives us SSG
// getServerSideProps works and gives us SSR
// important with getServerSideProps to pass context as it contains our qid cookie,
// otherwise voteStatus (did the logged-in user vote for a post?) wouldn't be able
// to resolve properly. on the client this works eitherway, but to get it working
// on the server, make sure to pass the context.
export async function getServerSideProps(context: NextPageContext) {
	const apolloClient = initializeApollo(null, context);

	await apolloClient.query({
		query: PostsDocument,
		variables: {
			limit: 15,
			cursor: null
		}
	});

	return addApolloState(apolloClient, {
		props: {}
	});
}

export default Index;
