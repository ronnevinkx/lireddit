import { Box, Button, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

import type { MeQuery } from '../__generated__/graphql';
import { MeDocument, useRegisterMutation } from '../__generated__/graphql';
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { toErrorMap } from '../utils/toErrorMap';
import { useIsNotAuth } from '../utils/useIsNotAuth';

interface RegisterProps {}

const Register: React.FC<RegisterProps> = () => {
	useIsNotAuth();

	const router = useRouter();
	const [register] = useRegisterMutation();

	return (
		<Layout variant="small">
			<Formik
				initialValues={{ email: '', username: '', password: '' }}
				onSubmit={async (values, { setErrors }) => {
					const res = await register({
						variables: { options: values },
						update: (cache, { data }) => {
							cache.writeQuery<MeQuery>({
								query: MeDocument,
								data: {
									__typename: 'Query',
									me: data?.register.user
								}
							});
						}
					});

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
						<Box mt={6} fontSize="sm">
							Have an account already?{' '}
							<NextLink href="/login">
								<Link>Log in</Link>
							</NextLink>
						</Box>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default Register;
