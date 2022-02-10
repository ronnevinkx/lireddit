import { Box, Heading } from '@chakra-ui/react';

import EditDeletePostButtons from '../../components/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';
import { withApollo } from '../../utils/withApollo';

interface PostProps {}

const Post: React.FC<PostProps> = () => {
	const { data, loading } = useGetPostFromUrl();

	if (loading) {
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
				prev={`/post/${data.post.id}`}
				creatorId={data.post.creator.id}
			/>
		</Layout>
	);
};

export default withApollo({ ssr: true })(Post);
