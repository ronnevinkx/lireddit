import { Button } from '@chakra-ui/button';
import { Box, Flex, Heading, Link, Stack, Text } from '@chakra-ui/layout';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import NextLink from 'next/link';
import { withUrqlClient } from 'next-urql';
import { useState } from 'react';

import { usePostsQuery } from '../__generated__/graphql';
import EditDeletePostButtons from '../components/EditDeletePostButtons';
import { Layout } from '../components/Layout';
import { UpvoteSection } from '../components/UpvoteSection';
import { createUrqlClient } from '../utils/createUrqlClient';

dayjs.extend(relativeTime);

interface IndexProps {}

const Index: React.FC<IndexProps> = () => {
	const [variables, setVariables] = useState({
		limit: 15,
		cursor: null as null | string
	});

	const [{ data, fetching }] = usePostsQuery({
		variables
	});

	if (!fetching && !data) {
		return <div>Failed to load posts.</div>;
	}

	return (
		<Layout>
			<Box>
				<Heading fontSize="lg">Latest posts</Heading>
			</Box>
			<Box mt={4}>
				{!data && fetching ? (
					<div>Loading...</div>
				) : (
					<Stack spacing={8}>
						{data!.posts.posts.map(post =>
							!post ? null : (
								<Flex
									key={post.id}
									p={5}
									shadow="md"
									borderWidth="1px"
								>
									<UpvoteSection post={post} />

									<Flex flex={1} align="start">
										<Box flex={1}>
											<NextLink
												href="/post/[id]"
												as={`/post/${post.id}`}
											>
												<Link href={`/post/${post.id}`}>
													<Heading fontSize="xl">
														{post.title}
													</Heading>
												</Link>
											</NextLink>
											<Text>
												posted by{' '}
												{post.creator.username}{' '}
												{dayjs(
													parseInt(post.createdAt)
												).fromNow()}
											</Text>
											<Text flex={1} mt={4}>
												{post.textSnippet}
											</Text>
										</Box>
										<Box ml="auto">
											<EditDeletePostButtons
												id={post.id}
												creatorId={post.creator.id}
											/>
										</Box>
									</Flex>
								</Flex>
							)
						)}
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
			{data && data.posts?.posts?.length === 0
				? 'No posts available.'
				: null}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
