import { useApolloClient } from '@apollo/client';
import { Button } from '@chakra-ui/button';
import { Box, Flex, Heading } from '@chakra-ui/layout';
import { Link } from '@chakra-ui/react';
import NextLink from 'next/link';

import { useLogoutMutation, useMeQuery } from '../__generated__/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = () => {
	const [logout, { loading: logoutLoading }] = useLogoutMutation();
	const apolloClient = useApolloClient();

	// don't execute this query on the server (e.g. on index page which is ssr),
	// because server doesn't have cookie. this would lead to me: null, so no user in navbar
	// later: we sent cookie to server via fetchOptions, but let's run this client-only anyway
	const { data, loading } = useMeQuery({
		skip: isServer()
	});

	let body = null;

	// on server, data should be undefined, since we paused the query there
	if (loading) {
		// data is loading
	} else if (!data?.me) {
		// user not logged in
		body = (
			<>
				<NextLink href="/login">
					<Link mr={4}>Login</Link>
				</NextLink>
				<NextLink href="/register">
					<Link>Register</Link>
				</NextLink>
			</>
		);
	} else {
		// user logged in
		body = (
			<Flex align="center">
				<NextLink href="/create-post">
					<Button as={Link} mr={4} href="/create-post">
						Create post
					</Button>
				</NextLink>
				<Box mr={4}>{data.me.username}</Box>
				<Button
					onClick={async () => {
						await logout();
						await apolloClient.resetStore();
					}}
					isLoading={logoutLoading}
					variant="link"
				>
					Log Out
				</Button>
			</Flex>
		);
	}

	return (
		<Flex
			position="sticky"
			top={0}
			zIndex={1}
			bg="tomato"
			p={4}
			align="center"
		>
			<NextLink href="/">
				<Link href="/">
					<Heading fontSize="xl">LiReddit</Heading>
				</Link>
			</NextLink>
			<Box ml="auto">{body}</Box>
		</Flex>
	);
};
