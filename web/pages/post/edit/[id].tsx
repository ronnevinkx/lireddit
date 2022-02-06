import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';

import {
	usePostQuery,
	useUpdatePostMutation
} from '../../../__generated__/graphql';
import { InputField } from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetIntId } from '../../../utils/useGetIntId';
import { useIsAuth } from '../../../utils/useIsAuth';

interface EditPostProps {}

const EditPost: React.FC<EditPostProps> = () => {
	useIsAuth();

	const intId = useGetIntId();
	const [{ data, fetching }] = usePostQuery({
		pause: intId === -1,
		variables: { id: intId }
	});
	const [, updatePost] = useUpdatePostMutation();
	const router = useRouter();

	if (fetching) {
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
					const { error } = await updatePost({
						id: intId,
						...values
					});

					if (!error) {
						// router.push('/');
						// TODO: make sure user comes from allowed url (/ or /post/[id])
						router.back();
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

export default withUrqlClient(createUrqlClient)(EditPost);
