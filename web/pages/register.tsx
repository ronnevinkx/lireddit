import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { useRouter } from 'next/router';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';
import { useRegisterMutation } from '../__generated__/graphql';

interface RegisterProps {}

const Register: React.FC<RegisterProps> = () => {
	const router = useRouter();
	const [, register] = useRegisterMutation();

	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ email: '', username: '', password: '' }}
				onSubmit={async (values, { setErrors }) => {
					const res = await register({ options: values });

					if (res.data?.register.errors) {
						setErrors(toErrorMap(res.data.register.errors));
					} else if (res.data?.register.user) {
						router.push('/');
					}
				}}
			>
				{({ isSubmitting }) => (
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
						<Box mt={4}>
							<InputField
								name="username"
								label="Username"
								placeholder="Username"
								type="text"
								autoComplete="username"
								required
							/>
						</Box>
						<Box mt={4}>
							<InputField
								name="password"
								label="Password"
								placeholder="Password"
								type="password"
								autoComplete="current-password"
								required
							/>
						</Box>
						<Button mt={4} type="submit" isLoading={isSubmitting}>
							Register
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(Register);
