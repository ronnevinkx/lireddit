import { Box, Flex } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../__generated__/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = () => {
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

	// don't execute this query on the server (e.g. on index page which is ssr),
	// because server doesn't have cookie. this would lead to me: null, so no user in navbar
	const [{ data, fetching }] = useMeQuery({
		pause: isServer()
	});

	let body = null;

	// on server, this should be undefined, since we paused the query there
	// console.log('DATA', data);

	if (fetching) {
		// data is loading
	} else if (!data?.me) {
		// user not logged in
		body = (
			<>
				<NextLink href="/login">
					<Link mr={2}>Login</Link>
				</NextLink>
				<NextLink href="/register">
					<Link>Register</Link>
				</NextLink>
			</>
		);
	} else {
		// user logged in
		body = (
			<Flex>
				<Box mr={2}>{data.me.username}</Box>
				<Button
					onClick={() => logout()}
					isLoading={logoutFetching}
					variant="link"
				>
					Log Out
				</Button>
			</Flex>
		);
	}

	return (
		<Flex position="sticky" top={0} zIndex={1} bg="tomato" p={4}>
			<Box ml="auto">{body}</Box>
		</Flex>
	);
};
