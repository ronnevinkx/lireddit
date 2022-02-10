import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useState } from 'react';

import { useForgotPasswordMutation } from '../__generated__/graphql';
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { useIsNotAuth } from '../utils/useIsNotAuth';
import { withApollo } from '../utils/withApollo';

interface ForgotPasswordProps {}

const ForgotPassword: React.FC<ForgotPasswordProps> = () => {
	useIsNotAuth();

	const [completed, setCompleted] = useState(false);
	const [forgotPassword] = useForgotPasswordMutation();

	return (
		<Layout variant="small">
			<Formik
				initialValues={{ email: '' }}
				onSubmit={async values => {
					await forgotPassword({ variables: values });
					setCompleted(true);
				}}
			>
				{({ isSubmitting }) =>
					completed ? (
						<Box>
							If an account with that email address exists, please
							check your email.
						</Box>
					) : (
						<Form>
							<Box>
								<InputField
									name="email"
									label="Email"
									placeholder="Email"
									type="email"
									autoComplete="email"
									required
								/>
							</Box>
							<Button
								mt={4}
								type="submit"
								isLoading={isSubmitting}
							>
								Submit
							</Button>
						</Form>
					)
				}
			</Formik>
		</Layout>
	);
};

export default withApollo({ ssr: false })(ForgotPassword);
