import { Box, Heading } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';

import EditDeletePostButtons from '../../components/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';

interface PostProps {}

const Post: React.FC<PostProps> = () => {
	const [{ data, fetching }] = useGetPostFromUrl();

	if (fetching) {
		return <div>Loading...</div>;
	}

	if (!data?.post) {
		return <div>Failed to load post.</div>;
	}

	return (
		<Layout>
			<Heading fontSize="xl" mb={4}>
				{data.post.title}
			</Heading>
			<Box mb={4}>{data.post.text}</Box>
			<EditDeletePostButtons
				id={data.post.id}
				creatorId={data.post.creator.id}
			/>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
