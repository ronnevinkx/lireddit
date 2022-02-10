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
| Apollo                 | GraphQL client                            |
| Graphcache             | Configurable, normalized caching for urql |
| GraphQL Code Generator | Generate types and urql hooks             |
| next-urql              | SSR for urql in a Next.js project         |
| dayjs                  | Formatting dates                          |

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
| ioredis               | In-memory data store                                    |
| connect-redis         | Provides Redis session storage for Express              |
| express-session       | To remember logged in user                              |
| nodemailer            | Send emails                                             |
| email-validator       | Validates format of email address                       |
| dataloader            | Batches multiple SQL statements into 1 for efficiency   |
| dotenv-safe           | Makes sure env variables are declared                   |
| gen-env-types         | Generates .env.example and types for env variables      |

## Frontend

### GraphQL Code Generator

Install CLI and wizard in project, then run wizard. In generated codegen.yml, replace `typescript-react-apollo` with `typescript-urql`. Deinstall `@graphql-codegen/typescript-react-apollo`. Then run `yarn add -D @graphql-codegen/typescript-urql`.

When running `yarn gen`, GraphQL Code Generator contacts the GraphQL endpoint to check the schema and generates our GraphQL types and hooks based on files in the `/graphql/` folder. The generator outputs to `/__generated__/graphql.tsx`. From there we can take hooks, so instead of the general `useMutation`, we now have specific hooks like `useLoginMutation` that are typed.

So our workflow is that for every mutation or query, we greate a `*.graphql` file in the `/graphql/*` folder. Then we run the generator, then we can use the hook from `/__generated__/graphql.tsx`.

## urql

Universal React Query Library, alternative to Apollo Client. We can wrap a page in `withUrqlClient(createUrqlClient)(MyPage)` to use urql (mutations, queries) and set ssr with `export default withUrqlClient(createUrqlClient, { ssr: true })(MyPage);` if we like.

### Scripts

| Script      | Runs Command                           | Description                      |
| ----------- | -------------------------------------- | -------------------------------- |
| `dev`       | `next dev`                             | Start server in dev mode         |
| `build`     | `next build`                           | Build app                        |
| `start`     | `next start`                           | Start server                     |
| `lint`      | `next lint`                            | Run code linter                  |
| `gen`       | `graphql-codegen --config codegen.yml` | Generate GraphQL types and hooks |
| `typecheck` | `tsc --noEmit --project tsconfig.json` | Check for type errors            |

## Backend

### TypeScript and Node Setup

Open two terminals. In 1: `yarn watch`, in 2: `yarn dev`.
Now when a TypeScript file changes, it compiles automatically to the dist folder and it's run automatically through nodemon.

| Script             | Runs Command                                  | Description                                        |
| ------------------ | --------------------------------------------- | -------------------------------------------------- |
| `watch`            | `tsc -w`                                      | Watch and compile TS to dist/index.js              |
| `dev`              | `nodemon dist/index.js`                       | Run and watch dist/index.js                        |
| `start`            | `node dist/index.js`                          | Run index.js on server                             |
| `start2`           | `ts-node src/index.ts`                        | -                                                  |
| `create:migration` | `mikro-orm migration:create`                  | (Removed) Creates migrations based on entities     |
| `build`            | `tsc`                                         | Builds the server with TypeScript                  |
| `gen-env`          | `npx gen-env-types .env -o src/env.d.ts -e .` | Generates .env.example and types for env variables |

### Postgres Setup

Simply create a database called `lireddit` with `psql`.

### Local Development

-   Terminal 1: `yarn watch` on server, this compiles TypeScript to dist folder on changes.
-   Terminal 2: `redis-server /usr/local/etc/redis.conf`, this runs Redis. If Redis already runs (perhaps after updating VS Code), shut it down first with `npx kill-port 6379`.
-   Terminal 3: `yarn dev` on server, this runs and auto-refreshes `dist/index.js` on changes with nodemon. So we basically have a chain.
-   Terminal 4: `yarn dev` on web frontend client.

Now you can visit the frontend at `http://localhost:3000/`.
GraphQL endpoint: `http://localhost:4000/graphql`

### MikroORM

Interacting with database, creating tables, selecting data and such. Later replaced by TypeORM.

`yarn add @mikro-orm/cli @mikro-orm/core @mikro-orm/migrations @mikro-orm/postgresql`

Create a migration: `npx mikro-orm migration:create` on command line. We've also made script for this in package.json, so we can run `yarn create:migration`.

### TypeORM

Create a migration, with a name flag: `npx typeorm migration:create -n FakePosts`, then put this file in the `migrations` folder.

Later, getting ready for production, set up `ormconfig.json` and spit out SQL that creates tables with:
`npx typeorm migration:generate -n Initial`.

This generates a migration in the server root. Put this in the `src/migrations` folder.

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

## Backend Deployment (Server, or "API")

Hostname (DigitalOcean Droplet name)
`lireddit`

What will app URLs look like?
`http://<app-name>.lireddit`

### 1. Create app and set up Postgres

1. Connect to Droplet:
   `ssh root@142.93.234.17`

2. Create app for backend called "api":
   `dokku apps:create api`

3. Create the backend service for PostgreSQL:
   `sudo dokku plugin:install https://github.com/dokku/dokku-postgres.git`

4. Create a database called "lireddit":
   `dokku postgres:create lireddit`

5. Link the database to the app:
   `dokku postgres:link lireddit api` ("dokku postgres:link service app")

DATABASE_URL: postgres://postgres:57b9d10be276ad22305e146622593dbb@dokku-postgres-lireddit:5432/lireddit

### 2. Set up Redis

1. Set up Redis:
   `sudo dokku plugin:install https://github.com/dokku/dokku-redis.git redis`

2. Set up a Redis instance called "olive":
   `dokku redis:create olive`

3. Link Redis to the app:
   `dokku redis:link olive api`

Check for Docker version: `docker -v`

List containers: `docker container list`
You should see a Redis and Postgres container.
VPS is now set up.

### 3. Build and deploy image

Use this exact process also when updating the server:

1. From server folder: `docker build -t ronnevinkx/lireddit:1.0 .`
2. Push to Docker Hub: `docker push ronnevinkx/lireddit:1.0`
3. SSH into the server, `docker login` to log into Docker Hub and:
   `docker pull ronnevinkx/lireddit:1.0`
4. Tag the pulled image: `docker tag ronnevinkx/lireddit:1.0 dokku/api:latest`
5. Deploy tag: `dokku tags:deploy api latest`

Application deployed!

### 4. Set up DNS

1. Create A record in Cloudflare that points `lireddit-api` subdomain to IP of server

Let this propagate for some time.

### 5. Port forwarding to internal app

1. Check current port mapping: `dokku proxy:report`
   (8080 is forwarded to 8080, but standard port 80 should be forwarded to 8080)
2. Map port: `dokku proxy:ports-set api http:80:8080`
3. Verify: `dokku proxy:ports api`

### 6. Setup SSL with Letsencrypt

1. Clear global hosts: `dokku domains:clear-global`
2. Add global domain: `dokku domains:add-global ronnevinkx.nl`
3. Set domain: `dokku domains:set api lireddit-api.ronnevinkx.nl`
4. Install Letsencrypt plugin:
   `sudo dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git`
5. Verify: `letsencrypt` command is now available, check with `dokku` ("Community plugin commands").
6. Set email address: `dokku config:set --no-restart api DOKKU_LETSENCRYPT_EMAIL=ronnevinkx@gmail.com`
   (verify by showing all env keys: `dokku config:show api`)
7. Enable certificate: `dokku letsencrypt:enable api`
8. Verify our new port map shows also 443 (https): `dokku proxy:report api`
   Verify expiry: `dokku letsencrypt:list`
9. Auto-renew via a cron job: `dokku letsencrypt:cron-job --add`

`https://lireddit-api.ronnevinkx.nl/` should now work with SSL and say "Cannot GET /".

## Frontend Deployment (Web)

Deploy to different server (Vercel), so we can take load off of API.

1. Build locally first and see if it passes: `yarn build`
2. To deploy to "preview" with Vercel CLI, go to the web folder and run `vercel`
   To deploy to "production" with Vercel CLI, go to the web folder and run `vercel --prod`
3. Set up environment variable for "production" and/or "preview" in Vercel dashboard:
   `NEXT_PUBLIC_API_URL` with value `https://lireddit-api.ronnevinkx.nl/graphql`
4. Create a CNAME record in Cloudflare pointing `lireddit` to `cname.vercel-dns.com`
   and don't proxy it, use Vercel's DNS.

## Make deploy script executable

`chmod +x deploy.sh`

## TODO

-   Install Husky with eslint, prettier and conventional commit check, changelog generation...
-   Deploy to GCP
-   when creating user, email not available on server, but works locally
-   update cache after posting a post
-   Upgrade all packages (one by one) and see what happens

## Notes

-   Should logged out user be able to vote?
-   Branch `apollo` created for Apollo Client (starting at 13:03:00)
-   How to handle n+1 problem: lots of sql without joins? dataloader
-   Best practice to use underscore when not using a parameter, like `(_, res)` instead of `(req, res)` when not using `req`.
-   At end of a thing that needs import, press `ctrl + space` to auto-complete the import statement
-   Installed `class-validator` to get rid of some TS error on server
-   [Mockaroo](https://www.mockaroo.com/) helped us get dummy data
-   Generate `.env` types and `.env.example` with `npx gen-env-types .env -o src/env.d.ts -e .`
-   hoe weet graphql-codegen wat de entities zijn?
    codegen.yml wijst naar graphql endpoint en gebruikt typescript-urql plugin
    urql is de graphql client (zoals apollo client er ook een is) en gebruiken we om
    info van de graph te verkrijgen (urql.useQuery e.d.)

-   waar dienen al deze packages precies voor?

server

```json
"dependencies": {
	"apollo-server-express": "2.16.1",
	"graphql": "^15.6.1",
	"type-graphql": "^1.1.1",
	"typeorm": "^0.2.40",
},
```

client

```json
"dependencies": {
	"@urql/exchange-graphcache": "^4.3.5",
	"graphql": "^16.0.0",
	"graphql-tag": "^2.12.6",
	"next-urql": "^3.2.1",
	"urql": "^2.0.5"
},
"devDependencies": {
	"@graphql-codegen/cli": "^2.2.2",
	"@graphql-codegen/typescript": "^2.3.0",
	"@graphql-codegen/typescript-operations": "^2.2.0",
	"@graphql-codegen/typescript-urql": "^3.3.0",
}
```
