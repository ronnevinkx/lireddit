# Full Stack React GraphQL TypeScript Tutorial

By Ben Awad
https://www.youtube.com/watch?v=I6ypD7qv3Z8

## Features

## Frontend Technologies

| Technology             | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| Next.js                | SSG and SSR React framework               |
| TypeScript             | JS-based programming language             |
| Chakra UI              | Styling framework                         |
| Formik                 | Helps building forms in React             |
| urql                   | GraphQL client                            |
| Graphcache             | Configurable, normalized caching for urql |
| GraphQL Code Generator | Generate types and urql hooks             |
| next-urql              | SSR for urql in a Next.js project         |

## Backend Technologies

| Technology            | Purpose                                                 |
| --------------------- | ------------------------------------------------------- |
| Express               | Handling middleware                                     |
| apollo-server-express | Creating GraphQL endpoint                               |
| TypeScript            | JS-based programming language                           |
| GraphQL               | Querying our API                                        |
| type-graphql          | Auto-create schemas for GraphQL from TypeScript         |
| Postgres              | Database                                                |
| MikroORM              | Interacting with database (later replaced with TypeORM) |
| TypeORM               | Interacting with database                               |
| argon2                | Password hashing                                        |
| redis                 | Data store                                              |
| connect-redis         | Provides Redis session storage for Express              |
| express-session       | To remember logged in user                              |
| nodemailer            | Send emails                                             |
| email-validator       | Validates format of email address                       |

## Frontend

### GraphQL Code Generator

Install CLI and wizard in project, then run wizard. In generated codegen.yml, replace `typescript-react-apollo` with `typescript-urql`. Deinstall `@graphql-codegen/typescript-react-apollo`. Then run `yarn add -D @graphql-codegen/typescript-urql`.

When running `yarn gen`, GraphQL Code Generator contacts the GraphQL endpoint to check the schema and generates our GraphQL types and hooks based on files in the `/graphql/` folder. The generator outputs to `/__generated__/graphql.tsx`. From there we can take hooks, so instead of the general `useMutation`, we now have specific hooks like `useLoginMutation` that are typed.

So our workflow is that for every mutation or query, we greate a `*.graphql` file in the `/graphql/*` folder. Then we run the generator, then we can use the hook from `/__generated__/graphql.tsx`.

## urql

Universal React Query Library, alternative to Apollo Client. We can wrap a page in `withUrqlClient(createUrqlClient)(MyPage)` to use urql (mutations, queries) and set ssr with `export default withUrqlClient(createUrqlClient, { ssr: true })(MyPage);` if we like.

### Scripts

| Script  | Runs Command                           | Description                      |
| ------- | -------------------------------------- | -------------------------------- |
| `dev`   | `next dev`                             | Start server in dev mode         |
| `build` | `next build`                           | Build app                        |
| `start` | `next start`                           | Start server                     |
| `lint`  | `next lint`                            | Run code linter                  |
| `gen`   | `graphql-codegen --config codegen.yml` | Generate GraphQL types and hooks |

## Backend

### TypeScript and Node Setup

Open two terminals. In 1: `yarn watch`, in 2: `yarn dev`.
Now when a TypeScript file changes, it compiles automatically to the dist folder and it's run automatically through nodemon.

| Script             | Runs Command                 | Description                           |
| ------------------ | ---------------------------- | ------------------------------------- |
| `watch`            | `tsc -w`                     | Watch and compile TS to dist/index.js |
| `dev`              | `nodemon dist/index.js`      | Run and watch dist/index.js           |
| `start`            | `node dist/index.js`         | Run index.js on server                |
| `start2`           | `ts-node src/index.ts`       | -                                     |
| `create:migration` | `mikro-orm migration:create` | Creates migrations based on entities  |

### Postgres Setup

Simply create a database called `lireddit` with `psql`.

### Local Development

-   Terminal 1: `yarn watch` on server, this compiles TypeScript to dist folder on changes.
-   Terminal 2: `yarn dev` on server, this runs and auto-refreshes `dist/index.js` on changes with nodemon. So we basically have a chain.
-   Terminal 3: `redis-server /usr/local/etc/redis.conf`, this runs Redis. If Redis already runs (perhaps after updating VS Code), shut it down first with `npx kill-port 6379`.
-   Terminal 4: `yarn dev` on web frontend client.

Now you can visit the frontend at `http://localhost:3000/`.
GraphQL endpoint: `http://localhost:4000/graphql`

### MikroORM

Interacting with database, creating tables, selecting data and such. Later replaced by TypeORM.

`yarn add @mikro-orm/cli @mikro-orm/core @mikro-orm/migrations @mikro-orm/postgresql`

Create a migration: `npx mikro-orm migration:create` on command line. We've also made script for this in package.json, so we can run `yarn create:migration`.

### TypeORM

Create a migration, with a name flag: `npx typeorm migration:create -n FakePosts`, then put this file in the `migrations` folder.

### GraphQL Server

`yarn add express apollo-server-express graphql type-graphql`

Install types for Express as dev dependencies: `yarn add -D @types/express`

### Redis

Redis is a key-value store, which we use for our session, which provides the `qid` cookie.

-   Install with: `brew install redis`
-   Then run to start and restart Redis automatically upon reboot: `brew services start redis`
-   Or run manually (I prefer this): `redis-server /usr/local/etc/redis.conf`

### Session

How the session works:

1. Session data `req.session.userId` is stored in Redis (`dyfgdfhdbssfdba -> { userId: 1}`, where `dyfgdfhdbssfdba` is the key)
2. `express-session` sets a cookie in browser, with signed version of Redis data
3. When user makes a request, cookie is sent to the server
4. Server decrypts cookie using session secret, turning unreadable cookie data into the Redis key `dyfgdfhdbssfdba`
5. Now we can read this data with `req.session.userId`

## Debugging

-   Kill a service? `npx kill-port 4000` for GraphQL, or `npx kill-port 6379` for Redis.
-   Manually, you could lookup the PID and then kill the process, but this is faster.

## Notes

-   We're `9:44:00` in
-   Deploy to GCP
-   update cache after posting a post
-   Protect routes like `create-post` against non-auth users and `register` against authenticated users. Do this serverside, so there's no flash of authenticated content (though this might not be an issue in PROD, perhaps only in Next.js DEV)
-   We could further clean up Mikro ORM (switched to TypeORM)
-   Upgrade all packages and see what happens
-   Based practice to use underscore when not using a parameter, like `(_, res)` instead of `(req, res)` when not using `req`.
-   At end of a thing that needs import, press `ctrl + space` to auto-complete the import snippet
-   Installed `class-validator` to get rid of some TS error
-   [Mockaroo](https://www.mockaroo.com/) helped us get dummy data
-   how to handle n+1 prblem: lots of sql without joins?
