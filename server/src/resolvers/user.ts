import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root
} from 'type-graphql';
import argon2 from 'argon2';
import { MyContext } from '../types';
import { User } from '../entities/User';
import { UsernamePasswordInput } from '../utils/UsernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { v4 } from 'uuid';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';

@ObjectType()
class FieldError {
	@Field()
	field: string;

	@Field()
	message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver(User)
export class UserResolver {
	@FieldResolver(() => String)
	email(@Root() user: User, @Ctx() { req }: MyContext) {
		// this is the current user and it's ok to show them their own email
		if (req.session.userId === user.id) {
			return user.email;
		}

		// current user wants to see someone elses email
		return '';
	}

	// read all
	@Query(() => [User])
	users(): Promise<User[]> {
		return User.find({});
	}

	// read single, current logged in user
	@Query(() => User, { nullable: true })
	me(@Ctx() { req }: MyContext) {
		// not logged in
		if (!req.session.userId) {
			return null;
		}

		return User.findOne(req.session.userId);
	}

	// register
	@Mutation(() => UserResponse)
	async register(
		@Arg('options') options: UsernamePasswordInput,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const errors = validateRegister(options);

		if (errors) {
			return { errors };
		}

		const hashedPassword = await argon2.hash(options.password);
		const user = await User.create({
			email: options.email,
			username: options.username,
			password: hashedPassword
		}).save();

		try {
		} catch (error) {
			// duplicate username/email error
			if (error.detail.includes('already exists')) {
				return {
					errors: [
						{
							field: 'username',
							message: 'Username or email already exists'
						},
						{
							field: 'email',
							message: 'Username or email already exists'
						}
					]
				};
			}
		}

		// log in newly registered user
		req.session.userId = user.id;

		return { user };
	}

	// login
	@Mutation(() => UserResponse)
	async login(
		@Arg('usernameOrEmail') usernameOrEmail: string,
		@Arg('password') password: string,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const user = await User.findOne(
			usernameOrEmail.includes('@')
				? { where: { email: usernameOrEmail } }
				: { where: { username: usernameOrEmail } }
		);

		if (!user) {
			return {
				errors: [
					{
						field: 'usernameOrEmail',
						message: "Username or email doesn't exist"
					}
				]
			};
		}

		const validPassword = await argon2.verify(user.password, password);

		if (!validPassword) {
			return {
				errors: [{ field: 'password', message: 'Incorrect password' }]
			};
		}

		req.session.userId = user.id;

		return { user };
	}

	// logout
	@Mutation(() => Boolean)
	logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
		return new Promise(resolve =>
			req.session.destroy(error => {
				res.clearCookie(COOKIE_NAME as string);

				if (error) {
					console.log('LOGOUT ERROR', error);
					resolve(false);
					return;
				}

				resolve(true);
			})
		);
	}

	// forgot password
	@Mutation(() => Boolean)
	async forgotPassword(
		@Arg('email') email: string,
		@Ctx() { redis }: MyContext
	) {
		const user = await User.findOne({ where: { email } });

		if (!user) {
			// email not in db, but don't tell the user
			return true;
		}

		const token = v4();

		// remember password token for 3 days
		await redis.set(
			FORGET_PASSWORD_PREFIX + token,
			user.id,
			'ex',
			1000 * 60 * 60 * 24 * 3
		);

		const link = `${process.env.WEB_CLIENT}/change-password/${token}`;
		const text = `Please reset your password here: ${link}`;
		const html = `<a href="${link}">Reset password</a>`;

		await sendEmail(user.email, 'Forgot password', text, html);

		return true;
	}

	// change password
	@Mutation(() => UserResponse)
	async changePassword(
		@Arg('token') token: string,
		@Arg('newPassword') newPassword: string,
		@Ctx() { req, redis }: MyContext
	): Promise<UserResponse> {
		if (newPassword.length <= 2) {
			return {
				errors: [
					{
						field: 'newPassword',
						message: 'Length must be greater than 2'
					}
				]
			};
		}

		const key = FORGET_PASSWORD_PREFIX + token;
		const userId = await redis.get(key);

		if (!userId) {
			return {
				errors: [
					{
						field: 'token',
						message: 'Token expired'
					}
				]
			};
		}

		const userIdNum = parseInt(userId);
		const user = await User.findOne(userIdNum);

		if (!user) {
			return {
				errors: [
					{
						field: 'token',
						message: 'User no longer exists'
					}
				]
			};
		}

		await User.update(
			{ id: userIdNum },
			{ password: await argon2.hash(newPassword) }
		);

		// delete token from redis so it can't be used again
		await redis.del(key);

		// log in user after change password
		req.session.userId = user.id;

		return { user };
	}

	// // delete
	// @Mutation(() => Boolean)
	// async deletePost(
	// 	@Arg('id') id: number,
	// 	@Ctx() { em }: MyContext
	// ): Promise<boolean> {
	// 	try {
	// 		await em.nativeDelete(Post, { id });
	// 		return true;
	// 	} catch (error) {
	// 		return false;
	// 	}
	// }
}
