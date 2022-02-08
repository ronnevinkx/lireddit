import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { useState } from 'react';

import { useChangePasswordMutation } from '../../__generated__/graphql';
import { InputField } from '../../components/InputField';
import { Layout } from '../../components/Layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';
import { useIsNotAuth } from '../../utils/useIsNotAuth';

interface ChangePasswordProps {}

const ChangePassword: NextPage<ChangePasswordProps> = () => {
	useIsNotAuth();

	const router = useRouter();
	const [, changePassword] = useChangePasswordMutation();
	const [tokenError, setTokenError] = useState('');

	return (
		<Layout variant="small">
			<Formik
				initialValues={{ newPassword: '' }}
				onSubmit={async (values, { setErrors }) => {
					const res = await changePassword({
						newPassword: values.newPassword,
						token:
							typeof router.query.token === 'string'
								? router.query.token
								: ''
					});

					if (res.data?.changePassword.errors) {
						const errorMap = toErrorMap(
							res.data.changePassword.errors
						);

						if ('token' in errorMap) {
							setTokenError(errorMap.token);
						}

						setErrors(errorMap);
					} else if (res.data?.changePassword.user) {
						router.push('/');
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<Box>
							<InputField
								name="newPassword"
								label="New password"
								placeholder="New password"
								type="password"
								autoComplete="new-password"
								required
							/>
						</Box>
						{tokenError ? (
							<Flex mt={2} fontSize="sm">
								<Box color="red.300" mr={1}>
									{tokenError},
								</Box>
								<NextLink href="/forgot-password">
									<Link>get another token</Link>
								</NextLink>
							</Flex>
						) : null}
						<Button mt={4} type="submit" isLoading={isSubmitting}>
							Change Password
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
