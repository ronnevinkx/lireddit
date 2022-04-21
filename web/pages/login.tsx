import { Box, Button, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

import {
	MeDocument,
	MeQuery,
	useLoginMutation
} from '../__generated__/graphql';
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { toErrorMap } from '../utils/toErrorMap';
import { useIsNotAuth } from '../utils/useIsNotAuth';

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
	useIsNotAuth();

	const router = useRouter();
	const [login] = useLoginMutation();

	return (
		<Layout variant="small">
			<Formik
				initialValues={{ usernameOrEmail: '', password: '' }}
				onSubmit={async (values, { setErrors }) => {
					const res = await login({
						variables: values,
						update: (cache, { data }) => {
							cache.writeQuery<MeQuery>({
								query: MeDocument,
								data: {
									__typename: 'Query',
									me: data?.login.user
								}
							});
							cache.evict({ fieldName: 'posts' });
						}
					});

					if (res.data?.login.errors) {
						setErrors(toErrorMap(res.data.login.errors));
					} else if (res.data?.login.user) {
						const nextPage =
							typeof router.query.next === 'string'
								? router.query.next
								: '/';
						router.push(nextPage);
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<Box>
							<InputField
								name="usernameOrEmail"
								label="Username or email"
								placeholder="Username or email"
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
						<Box mt={2} fontSize="sm">
							<NextLink href="/forgot-password">
								<Link>Forgot password?</Link>
							</NextLink>
						</Box>
						<Button mt={4} type="submit" isLoading={isSubmitting}>
							Log In
						</Button>
						<Box mt={6} fontSize="sm">
							No account yet?{' '}
							<NextLink href="/register">
								<Link>Register</Link>
							</NextLink>
						</Box>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default Login;
