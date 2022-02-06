import {
	Arg,
	InputType,
	Mutation,
	Query,
	Resolver,
	Field,
	Ctx,
	UseMiddleware,
	Int,
	FieldResolver,
	Root,
	ObjectType
} from 'type-graphql';
import { MyContext } from '../types';
import { isAuth } from '../middleware/isAuth';
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
import { Vote } from '../entities/Vote';
import { User } from '../entities/User';

@InputType()
export class PostInput {
	@Field()
	title: string;

	@Field()
	text: string;
}

@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];

	@Field()
	hasMore: boolean;
}

// say what we're resolving with @Resolver(Post) because of the FieldResolver
@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, 50);
	}

	@FieldResolver(() => User)
	creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
		// return User.findOne(post.creatorId);
		// userLoader reduces all individual user select statements
		// for homepage to 1 sql statement
		return userLoader.load(post.creatorId);
	}

	@FieldResolver(() => Int, { nullable: true })
	async voteStatus(
		@Root() post: Post,
		@Ctx() { voteLoader, req }: MyContext
	) {
		if (!req.session.userId) {
			return null;
		}

		const vote = await voteLoader.load({
			postId: post.id,
			userId: req.session.userId
		});

		return vote ? vote.value : null;
	}

	// read all
	@Query(() => PaginatedPosts)
	async posts(
		@Arg('limit', () => Int) limit: number,
		@Arg('cursor', () => String, { nullable: true }) cursor: string | null
	): Promise<PaginatedPosts> {
		// return Post.find({});
		// fetch one post extra to see if hasMore should be true (for pagination)
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;
		const replacements: any[] = [realLimitPlusOne];

		// if (req.session.userId) {
		// 	replacements.push(req.session.userId);
		// }

		// let cursorIndex = 3;

		if (cursor) {
			replacements.push(new Date(parseInt(cursor)));
			// cursorIndex = replacements.length;
		}

		const posts = await getConnection().query(
			`
			SELECT p.*
			FROM post p
			INNER JOIN public.user u ON u.id = p."creatorId"
			${cursor ? `WHERE p."createdAt" < $2` : ''}
			ORDER BY p."createdAt" DESC
			LIMIT $1
		`,
			replacements
		);

		// with dataloader:
		// const posts = await getConnection().query(
		// 	`
		// 	SELECT p.*,
		// 	${
		// 		req.session.userId
		// 			? '(SELECT value FROM vote WHERE "userId" = $2 AND "postId" = p.id) "voteStatus"'
		// 			: 'NULL AS "voteStatus"'
		// 	}
		// 	FROM post p
		// 	INNER JOIN public.user u ON u.id = p."creatorId"
		// 	${cursor ? `WHERE p."createdAt" < $${cursorIndex}` : ''}
		// 	ORDER BY p."createdAt" DESC
		// 	LIMIT $1
		// `,
		// 	replacements
		// );

		// without dataloader:
		// const posts = await getConnection().query(
		// 	`
		// 	SELECT p.*,
		// 	json_build_object(
		// 		'id', u.id,
		// 		'username', u.username,
		// 		'email', u.email,
		// 		'updatedAt', u."updatedAt",
		// 		'createdAt', u."createdAt") creator,
		// 	${
		// 		req.session.userId
		// 			? '(SELECT value FROM vote WHERE "userId" = $2 AND "postId" = p.id) "voteStatus"'
		// 			: 'NULL AS "voteStatus"'
		// 	}
		// 	FROM post p
		// 	INNER JOIN public.user u ON u.id = p."creatorId"
		// 	${cursor ? `WHERE p."createdAt" < $${cursorIndex}` : ''}
		// 	ORDER BY p."createdAt" DESC
		// 	LIMIT $1
		// `,
		// 	replacements
		// );

		// const qb = getConnection()
		// 	.getRepository(Post)
		// 	.createQueryBuilder('p')
		// 	.innerJoinAndSelect('p.creator', 'u', 'u.id = p."creatorId"')
		// 	.orderBy('p."createdAt"', 'DESC')
		// 	.take(realLimitPlusOne);

		// if (cursor) {
		// 	// if we pass cursor of post id 8 with a limit of 2, we get posts 7 and 6
		// 	qb.where('p."createdAt" < :cursor', {
		// 		cursor: new Date(parseInt(cursor))
		// 	});
		// }

		// const posts = await qb.getMany();

		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne
		};
	}

	// read single
	@Query(() => Post, { nullable: true })
	async post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
		// relation no longer needed with dataloader and fieldresolver for creator
		return Post.findOne(id);
		// return Post.findOne(id, { relations: ['creator'] });

		// json_build_object(
		// 	'id', u.id,
		// 	'username', u.username,
		// 	'email', u.email,
		// 	'updatedAt', u."updatedAt",
		// 	'createdAt', u."createdAt") creator,
		// ${
		// 	req.session.userId
		// 		? '(SELECT value FROM vote WHERE "userId" = $2 AND "postId" = p.id) "voteStatus"'
		// 		: 'NULL AS "voteStatus"'
		// }

		// const post = await getConnection().query(
		// 	`
		// 	SELECT p.*,
		// 	json_build_object(
		// 		'id', u.id,
		// 		'username', u.username,
		// 		'email', u.email,
		// 		'updatedAt', u."updatedAt",
		// 		'createdAt', u."createdAt") creator
		// 	FROM post p
		// 	INNER JOIN public.user u ON u.id = p."creatorId"
		// 	WHERE p."id" = $1
		// `,
		// 	[id]
		// );

		// return post[0];
	}

	// create
	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg('input') input: PostInput,
		@Ctx() { req }: MyContext
	): Promise<Post> {
		// 2 sql queries, 1 to save, 1 to select
		return Post.create({ ...input, creatorId: req.session.userId }).save();
	}

	// update
	@Mutation(() => Post, { nullable: true })
	@UseMiddleware(isAuth)
	async updatePost(
		@Arg('id', () => Int) id: number,
		@Arg('title') title: string,
		@Arg('text') text: string,
		@Ctx() { req }: MyContext
	): Promise<Post | null> {
		const result = await getConnection()
			.createQueryBuilder()
			.update(Post)
			.set({ title, text })
			.where('id = :id AND "creatorId" = :creatorId', {
				id,
				creatorId: req.session.userId
			})
			.returning('*')
			.execute();

		return result.raw[0];
	}

	// delete
	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async deletePost(
		@Arg('id', () => Int) id: number,
		@Ctx() { req }: MyContext
	): Promise<boolean> {
		// now that we've set `onDelete: 'CASCADE'` at the Vote entity,
		// we can simply do this and the deletion will cascade to any votes
		// of the post the downside is, the non-cascade is more explicit to
		// developers, so it depends on the project what's best
		await Post.delete({ id, creatorId: req.session.userId });
		return true;

		// non-cascade way
		// const post = await Post.findOne(id);

		// if (!post) {
		// 	return false;
		// }

		// // only delete posts that you own
		// if (post.creatorId !== req.session.userId) {
		// 	throw new Error('Not authorized to delete this post');
		// }

		// await Vote.delete({ postId: id });
		// await Post.delete({ id });

		// return true;
	}

	// vote
	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg('postId', () => Int) postId: number,
		@Arg('value', () => Int) value: number,
		@Ctx() { req }: MyContext
	) {
		const isUpvote = value !== -1;
		const realValue = isUpvote ? 1 : -1;
		const { userId } = req.session;

		const vote = await Vote.findOne({ where: { postId, userId } });

		// the user has voted on the post before and is changing his vote
		if (vote && vote.value !== realValue) {
			await getConnection().transaction(async tm => {
				await tm.query(
					`
					UPDATE vote
					SET value = $1
					WHERE "postId" = $2 AND "userId" = $3
				`,
					[realValue, postId, userId]
				);

				// when changing from upvote to downvote or vice versa, we have to add or subtract 2 points, hence the 2 * realValue
				await tm.query(
					`
					UPDATE post
					SET points = points + $1
					WHERE id = $2
				`,
					[2 * realValue, postId]
				);
			});
		} else if (!vote) {
			// has never voted before

			// typeorm will handle starting and commiting the transaction this way
			// (tm = transaction manager), so we can use prepared statements with parameters
			await getConnection().transaction(async tm => {
				await tm.query(
					`
					INSERT INTO vote ("userId", "postId", value)
					VALUES ($1, $2, $3)
				`,
					[userId, postId, realValue]
				);

				await tm.query(
					`
					UPDATE post
					SET points = points + $1
					WHERE id = $2
				`,
					[realValue, postId]
				);
			});

			// await Vote.insert({
			// 	userId,
			// 	postId,
			// 	value: realValue
			// });

			// a single statement with 2 queries using sql transactions
			// benefit: if one query fails, all fail
			// getConnection().query(`
			// START TRANSACTION;

			// INSERT INTO vote ("userId", "postId", value)
			// VALUES (${userId}, ${postId}, ${realValue});

			// UPDATE post
			// SET points = points + ${realValue}
			// WHERE id = ${postId};

			// COMMIT;
			// `);

			// using prepared statements, not working...
			// getConnection().query(
			// 	`
			// 	START TRANSACTION;

			// 	INSERT INTO votes ("userId", "postId", value)
			// 	VALUES ($s1, $s2, $s3);

			// 	UPDATE post
			// 	SET points = points + $4
			// 	WHERE id = $5;

			// 	COMMIT;
			// `,
			// 	[userId, postId, realValue, realValue, postId]
			// );
		}

		return true;
	}
}
