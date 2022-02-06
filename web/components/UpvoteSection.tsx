import { IconButton } from '@chakra-ui/button';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, Flex } from '@chakra-ui/layout';
import { useState } from 'react';

import { PostSnippetFragment, useVoteMutation } from '../__generated__/graphql';

interface UpvoteSectionProps {
	post: PostSnippetFragment;
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
	const [loadingState, setLoadingState] = useState<
		'upvote-loading' | 'downvote-loading' | 'not-loading'
	>('not-loading');
	const [, vote] = useVoteMutation();

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
				onClick={async () => {
					if (post.voteStatus === 1) {
						return;
					}

					setLoadingState('upvote-loading');
					await vote({ postId: post.id, value: 1 });
					setLoadingState('not-loading');
				}}
				colorScheme={post.voteStatus === 1 ? 'green' : undefined}
				isLoading={loadingState === 'upvote-loading'}
			/>
			<Box my={2}>{post.points}</Box>
			<IconButton
				aria-label="Downvote post"
				icon={<ChevronDownIcon />}
				onClick={async () => {
					if (post.voteStatus === -1) {
						return;
					}

					setLoadingState('downvote-loading');
					await vote({ postId: post.id, value: -1 });
					setLoadingState('not-loading');
				}}
				colorScheme={post.voteStatus === -1 ? 'red' : undefined}
				isLoading={loadingState === 'downvote-loading'}
			/>
		</Flex>
	);
};
