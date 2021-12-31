import { Button } from '@chakra-ui/button';
import { Box, Flex, Heading, Link, Stack, Text } from '@chakra-ui/layout';
import NextLink from 'next/link';
import { withUrqlClient } from 'next-urql';
import { useState } from 'react';

import { usePostsQuery } from '../__generated__/graphql';
import Layout from '../components/Layout';
import { UpvoteSection } from '../components/UpvoteSection';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
	const [variables, setVariables] = useState({
		limit: 15,
		cursor: null as null | string
	});
	console.log('VARS', variables);
	const [{ data, fetching }] = usePostsQuery({
		variables
	});

	if (!fetching && !data) {
		return <div>Failed to load posts.</div>;
	}

	return (
		<Layout>
			<Flex align="center">
				<Heading>LiReddit</Heading>
				<NextLink href="/create-post">
					<Link ml="auto">Create post</Link>
				</NextLink>
			</Flex>
			<Box mt={6}>
				{!data && fetching ? (
					<div>Loading...</div>
				) : (
					<Stack spacing={8}>
						{data!.posts.posts.map(post => (
							<Flex
								key={post.id}
								p={5}
								shadow="md"
								borderWidth="1px"
							>
								<UpvoteSection post={post} />
								<Box>
									<Heading fontSize="xl">
										{post.title}
									</Heading>
									<Text>
										posted by {post.creator.username}
									</Text>
									<Text mt={4}>{post.textSnippet}</Text>
								</Box>
							</Flex>
						))}
					</Stack>
				)}
			</Box>
			{data && data.posts.hasMore ? (
				<Flex>
					<Button
						onClick={() =>
							setVariables({
								...variables,
								cursor: data.posts.posts[
									data.posts.posts.length - 1
								].createdAt
							})
						}
						isLoading={fetching}
						m="auto"
						my={8}
					>
						Load More
					</Button>
				</Flex>
			) : null}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
