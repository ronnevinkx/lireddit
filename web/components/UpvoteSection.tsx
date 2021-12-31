import { IconButton } from '@chakra-ui/button';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Flex } from '@chakra-ui/layout';
import { useState } from 'react';

import { PostSnippetFragment, useVoteMutation } from '../__generated__/graphql';

interface UpvoteSectionProps {
	post: PostSnippetFragment;
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
	const [loadingState, setLoadingState] = useState<
		'upvote-loading' | 'downvote-loading' | 'not-loading'
	>('not-loading');
	const [{ operation }, vote] = useVoteMutation();
	// console.log(operation?.variables?.value); // 1 or 2

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
					setLoadingState('upvote-loading');
					await vote({ postId: post.id, value: 1 });
					setLoadingState('not-loading');
				}}
				isLoading={loadingState === 'upvote-loading'}
			/>
			{post.points}
			<IconButton
				aria-label="Downvote post"
				icon={<ChevronDownIcon />}
				onClick={async () => {
					setLoadingState('downvote-loading');
					await vote({ postId: post.id, value: -1 });
					setLoadingState('not-loading');
				}}
				isLoading={loadingState === 'downvote-loading'}
			/>
		</Flex>
	);
};
