import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useState } from 'react';

import { useForgotPasswordMutation } from '../__generated__/graphql';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { createUrqlClient } from '../utils/createUrqlClient';

interface ForgotPasswordProps {}

const ForgotPassword: React.FC<ForgotPasswordProps> = () => {
	const [completed, setCompleted] = useState(false);
	const [, forgotPassword] = useForgotPasswordMutation();

	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ email: '' }}
				onSubmit={async values => {
					await forgotPassword(values);
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
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
