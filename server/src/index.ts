import 'reflect-metadata';
// import { MikroORM } from '@mikro-orm/core';
// import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { COOKIE_NAME, __prod__ } from './constants';
import { MyContext } from './types';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { User } from './entities/User';
import { Post } from './entities/Post';
import { Vote } from './entities/Vote';
import path from 'path';

const main = async () => {
	// sendEmail('ronnevinkx@gmail.com', 'Hi Ronne! This is Node.js');
	require('dotenv').config();

	const conn = await createConnection({
		type: 'postgres',
		database: 'lireddit2',
		username: 'postgres',
		password: 'postgres',
		logging: true,
		synchronize: true,
		migrations: [path.join(__dirname, './migrations/*')],
		entities: [Post, User, Vote]
	});

	await conn.runMigrations();

	// await Post.delete({});

	// connect to db
	// const orm = await MikroORM.init(mikroConfig);

	// deletes all users
	// await orm.em.nativeDelete(User, {});

	// run migrations
	// orm.getMigrator().up();

	const app = express();
	const PORT = process.env.PORT || 4000;
	const NODE_ENV = process.env.NODE_ENV || 'development';
	const WEB_CLIENT = process.env.WEB_CLIENT || 'http://localhost:3000';

	// redis setup
	const RedisStore = connectRedis(session);
	const redis = new Redis();

	// set cors on all routes
	// we also could've set it for just apollo route at apollo setup,
	// but we like to set it globally
	app.use(cors({ origin: WEB_CLIENT, credentials: true }));

	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redis,
				disableTouch: true
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
				httpOnly: true, // httpOnly, so not available in frontend JS
				sameSite: 'lax', // csrf
				secure: __prod__ // when in prod, cookie only works in https
			},
			saveUninitialized: false,
			secret: process.env.REDIS_SECRET || 'x#er@$tSrD*%^s#4$^6_$^k',
			resave: false
		})
	);

	// apollo setup
	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false
		}),
		context: ({ req, res }): MyContext => ({ req, res, redis })
	});

	apolloServer.applyMiddleware({ app, cors: false });

	app.listen(PORT, () => {
		const today = new Date();
		const hours =
			today.getHours() < 10 ? '0' + today.getHours() : today.getHours();
		const minutes =
			today.getMinutes() < 10
				? '0' + today.getMinutes()
				: today.getMinutes();
		const seconds =
			today.getSeconds() < 10
				? '0' + today.getSeconds()
				: today.getSeconds();

		const time = hours + ':' + minutes + ':' + seconds;

		console.log(
			`${time}: Server is running in ${NODE_ENV} mode on port ${PORT}`
		);
	});
};

main().catch(error => console.error(error));
