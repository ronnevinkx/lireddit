import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';

import {
	usePostQuery,
	useUpdatePostMutation
} from '../../../__generated__/graphql';
import { InputField } from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import { useGetIntId } from '../../../utils/useGetIntId';
import { useIsAuth } from '../../../utils/useIsAuth';

interface EditPostProps {}

const EditPost: React.FC<EditPostProps> = () => {
	useIsAuth();

	const intId = useGetIntId();
	const { data, loading } = usePostQuery({
		skip: intId === -1,
		variables: { id: intId }
	});
	const [updatePost] = useUpdatePostMutation();
	const router = useRouter();

	const backToValidPrevPage = (): void => {
		const nextPage = router.query.prev
			? (router.query.prev as string)
			: '/';
		router.push(nextPage);
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!data?.post) {
		return <div>Failed to load post.</div>;
	}

	return (
		<Layout variant="small">
			<Formik
				initialValues={{ title: data.post.title, text: data.post.text }}
				onSubmit={async values => {
					const { errors } = await updatePost({
						variables: { id: intId, ...values }
					});

					if (!errors) {
						backToValidPrevPage();
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<Box>
							<InputField
								name="title"
								label="Title"
								placeholder="Title"
								type="text"
								required
							/>
						</Box>
						<Box mt={4}>
							<InputField
								name="text"
								label="Text"
								placeholder="Text"
								textarea
								required
							/>
						</Box>
						<Button mt={4} type="submit" isLoading={isSubmitting}>
							Update Post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default EditPost;
