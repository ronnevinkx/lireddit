import type { ApolloCache } from '@apollo/client';
import { gql } from '@apollo/client';
import { IconButton } from '@chakra-ui/button';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, Flex } from '@chakra-ui/layout';
import { useState } from 'react';

import type {
	PostSnippetFragment,
	VoteMutation
} from '../__generated__/graphql';
import { useMeQuery, useVoteMutation } from '../__generated__/graphql';

interface UpvoteSectionProps {
	post: PostSnippetFragment;
}

const updateAfterVote = (
	value: number,
	postId: number,
	cache: ApolloCache<VoteMutation>
) => {
	const data = cache.readFragment<{
		id: number;
		points: number;
		voteStatus: number | null;
	}>({
		id: 'Post:' + postId,
		fragment: gql`
			fragment _ on Post {
				id
				points
				voteStatus
			}
		`
	});

	if (data) {
		if (data.voteStatus === value) {
			return;
		}

		// if we are changing our vote, do -2 or +2 to switch points correctly
		const newPoints =
			(data.points as number) + (!data.voteStatus ? 1 : 2) * value;

		cache.writeFragment({
			id: 'Post:' + postId,
			fragment: gql`
				fragment _ on Post {
					points
					voteStatus
				}
			`,
			data: { points: newPoints, voteStatus: value }
		});
	}
};

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
	const { data, loading } = useMeQuery();
	const disableButton = loading || !data?.me;

	const [loadingState, setLoadingState] = useState<
		'upvote-loading' | 'downvote-loading' | 'not-loading'
	>('not-loading');
	const [vote] = useVoteMutation();

	return (
		<Flex
			direction="column"
			alignItems="center"
			justifyContent="center"
			mr={4}
		>
			<IconButton
				aria-label="Upvote post"
				icon={<ChevronUpIcon />}
				disabled={disableButton}
				onClick={async () => {
					if (post.voteStatus === 1) {
						return;
					}

					setLoadingState('upvote-loading');
					const { errors } = await vote({
						variables: { postId: post.id, value: 1 },
						update: cache => updateAfterVote(1, post.id, cache)
					});
					setLoadingState('not-loading');

					if (errors) {
						console.log('ERRORS', errors);
					}
				}}
				colorScheme={post.voteStatus === 1 ? 'green' : undefined}
				isLoading={loadingState === 'upvote-loading'}
			/>
			<Box my={2}>{post.points}</Box>
			<IconButton
				aria-label="Downvote post"
				icon={<ChevronDownIcon />}
				disabled={disableButton}
				onClick={async () => {
					if (post.voteStatus === -1) {
						return;
					}

					setLoadingState('downvote-loading');
					await vote({
						variables: { postId: post.id, value: -1 },
						update: cache => updateAfterVote(-1, post.id, cache)
					});
					setLoadingState('not-loading');
				}}
				colorScheme={post.voteStatus === -1 ? 'red' : undefined}
				isLoading={loadingState === 'downvote-loading'}
			/>
		</Flex>
	);
};
