import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';

import { useCreatePostMutation } from '../__generated__/graphql';
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
// import { toErrorMap } from '../utils/toErrorMap';
import { useIsAuth } from '../utils/useIsAuth';

interface CreatePostProps {}

const CreatePost: React.FC<CreatePostProps> = () => {
	useIsAuth();

	const [createPost] = useCreatePostMutation();
	const router = useRouter();

	return (
		<Layout variant="small">
			<Formik
				initialValues={{ title: '', text: '' }}
				onSubmit={async (values, { setErrors }) => {
					const { errors } = await createPost({
						variables: { input: values },
						update: cache => {
							// evict the posts query
							cache.evict({ fieldName: 'posts' });
						}
					});

					if (!errors) {
						router.push('/');
					}
					// router.push('/');
					// console.log('RES', res);

					// if (error?.message.includes('Not authenticated')) {
					// 	//
					// }

					// if (res.data?.login.errors) {
					// 	setErrors(toErrorMap(res.data.login.errors));
					// } else if (res.data?.login.user) {
					// 	router.push('/');
					// }
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
							Create Post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default CreatePost;
