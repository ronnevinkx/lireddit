import { Box, Heading } from '@chakra-ui/react';

import { Post, PostDocument, PostsDocument } from '../../__generated__/graphql';
import EditDeletePostButtons from '../../components/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { initializeApollo } from '../../utils/apolloClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';

const Post: React.FC<{ post: Post }> = ({ post }) => {
	// const { data, loading } = useGetPostFromUrl();

	// if (loading) {
	// 	return <div>Loading...</div>;
	// }

	// if (!data?.post) {
	// 	return <div>Failed to load post.</div>;
	// }

	return (
		<Layout>
			<Heading fontSize="xl" mb={4}>
				{post.title}
			</Heading>
			<Box mb={4}>{post.text}</Box>
			<EditDeletePostButtons
				id={post.id}
				prev={`/post/${post.id}`}
				creatorId={post.creator.id}
			/>
		</Layout>
	);
};

export default Post;

// destructure id from context.params.id
interface ParamProps {
	params: {
		id: string;
	};
}
export async function getStaticProps({ params: { id } }: ParamProps) {
	const apolloClient = initializeApollo();

	const result = await apolloClient.query({
		query: PostDocument,
		variables: {
			id: parseInt(id)
		}
	});

	return {
		props: {
			post: result.data.post
		}
	};
}

// getStaticPaths tells Next which pages should be statically generated at build time
// this is a Node.js context, so we can't use the generated hooks
export const getStaticPaths = async () => {
	const apolloClient = initializeApollo();

	const result = await apolloClient.query({
		query: PostsDocument,
		variables: {
			limit: 50, // these should be unlimited
			cursor: null
		}
	});

	const paths = result.data.posts.posts.map((post: Post) => {
		return { params: { id: post.id.toString() } };
	});

	// if we set fallback to 'blocking', Next will wait for the page to be generated
	// via SSR, then cache it for future requests
	return {
		paths,
		fallback: 'blocking'
	};
};
