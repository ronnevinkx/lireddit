declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      NODE_ENV: string;
      DATABASE_URL: string;
      REDIS_URL: string;
      REDIS_SECRET: string;
      WEB_CLIENT: string;
      DOMAIN: string;
      COOKIEDOMAIN: string;
    }
  }
}

export {}
