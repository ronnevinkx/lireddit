import { IconButton } from '@chakra-ui/button';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, Link } from '@chakra-ui/layout';
import NextLink from 'next/link';

import { useDeletePostMutation, useMeQuery } from '../__generated__/graphql';

interface EditDeletePostButtonsProps {
	id: number;
	prev: string;
	creatorId: number;
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
	id,
	prev,
	creatorId
}) => {
	const { data: meData } = useMeQuery();
	const [deletePost] = useDeletePostMutation();

	if (meData?.me?.id !== creatorId) {
		return null;
	}

	return (
		<Box>
			<NextLink href={`/post/edit/${id}?prev=${prev}`}>
				<IconButton
					aria-label="Edit Post"
					icon={<EditIcon />}
					as={Link}
				/>
			</NextLink>
			<IconButton
				ml={2}
				aria-label="Delete Post"
				icon={<DeleteIcon />}
				onClick={() => {
					deletePost({
						variables: { id },
						update: cache => {
							cache.evict({ id: 'Post:' + id });
						}
					});
				}}
			/>
		</Box>
	);
};

export default EditDeletePostButtons;
