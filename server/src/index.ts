import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import 'dotenv-safe/config';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import path from 'path';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { Vote } from './entities/Vote';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { MyContext } from './types';
import { createUserLoader } from './utils/createUserLoader';
import { createVoteLoader } from './utils/createVoteLoader';
import { timestamp } from './utils/timestamp';

const main = async () => {
	const conn = await createConnection({
		type: 'postgres',
		url: process.env.DATABASE_URL,
		logging: true,
		// synchronize: true,
		migrations: [path.join(__dirname, './migrations/*')],
		entities: [Post, User, Vote]
	});

	if (__prod__) {
		// this creates tables when server starts, using the "Initial" migration
		await conn.runMigrations();
	}

	const app = express();
	const PORT = parseInt(process.env.PORT) || 4000;
	const NODE_ENV = process.env.NODE_ENV || 'development';
	const WEB_CLIENT = process.env.WEB_CLIENT || 'http://localhost:3000';

	// redis setup
	const RedisStore = connectRedis(session);
	const redis = new Redis(process.env.REDIS_URL);

	// tell express we have a proxy (dokku's nginx) sitting in front, so cookies and sessions work
	app.set('trust proxy', 1);

	// set cors on all routes
	// we also could've set it for just apollo route at apollo setup,
	// but we like to set it globally
	app.use(cors({ origin: WEB_CLIENT, credentials: true }));

	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redis as any,
				disableTouch: true
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
				httpOnly: true, // httpOnly, so not available in frontend JS
				sameSite: 'lax', // csrf
				secure: __prod__, // when in prod, cookie only works in https
				domain: __prod__ ? process.env.COOKIEDOMAIN : undefined
			},
			saveUninitialized: false,
			secret: process.env.REDIS_SECRET,
			resave: false
		})
	);

	// apollo setup
	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [PostResolver, UserResolver],
			validate: false
		}),
		context: ({ req, res }): MyContext => ({
			req,
			res,
			redis,
			userLoader: createUserLoader(),
			voteLoader: createVoteLoader()
		})
	});

	apolloServer.applyMiddleware({ app, cors: false });

	app.listen(PORT, () => {
		console.log(
			`${timestamp()}: 🚀 Server is now running in ${NODE_ENV} mode on http://localhost:${PORT}${
				apolloServer.graphqlPath
			}`
		);
	});
};

main().catch(error => console.error(error));
