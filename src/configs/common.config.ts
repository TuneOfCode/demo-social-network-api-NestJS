import * as dotenv from 'dotenv';
export const file = {
  dev: '.env.dev',
  prod: '.env.prod',
};
const configuration = {
  port: +process.env.APP_PORT,
  pathEnv: file.dev,
};
dotenv.config({
  path: configuration.pathEnv,
});
export const env = {
  APP_PORT: process.env.APP_PORT,
  APP_DOMAIN: process.env.APP_DOMAIN_API,
  APP_ROOT_STORAGE: process.env.APP_ROOT_STORAGE,
  DB_TYPE: process.env.DB_TYPE,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: +process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_EXPIES_IN: process.env.JWT_ACCESS_TOKEN_EXPIES_IN,
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_EXPIES_IN: process.env.JWT_REFRESH_TOKEN_EXPIES_IN,
  JWT_COOKIE: process.env.JWT_COOKIE,
};

export const storageOfUploadFile = {
  user: 'avatars',
  post: 'posts',
};

export default configuration;
