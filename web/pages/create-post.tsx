import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';

import { useCreatePostMutation } from '../__generated__/graphql';
import { InputField } from '../components/InputField';
import Layout from '../components/Layout';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';
import { useIsAuth } from '../utils/useIsAuth';

interface Props {}

const CreatePost: React.FC<Props> = () => {
	useIsAuth();

	const [, createPost] = useCreatePostMutation();
	const router = useRouter();

	return (
		<Layout variant="small">
			<Formik
				initialValues={{ title: '', text: '' }}
				onSubmit={async (values, { setErrors }) => {
					const { error } = await createPost({ input: values });

					if (!error) {
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

export default withUrqlClient(createUrqlClient)(CreatePost);
