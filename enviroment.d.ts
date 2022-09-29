declare namespace NodeJS {
  export interface ProcessEnv {
    APP_PORT?: string;
    APP_DOMAIN_API?: string;
    APP_ORIGIN_IN_CORS?: string;
    APP_ROOT_STORAGE?: string;
    DB_TYPE?: string;
    DB_HOST?: string;
    DB_PORT?: string;
    DB_USERNAME?: string;
    DB_PASSWORD?: string;
    DB_DATABASE?: string;
    JWT_ACCESS_TOKEN_SECRET?: string;
    JWT_ACCESS_TOKEN_EXPIES_IN?: string;
    JWT_REFRESH_TOKEN_SECRET?: string;
    JWT_REFRESH_TOKEN_EXPIES_IN?: string;
    JWT_COOKIE?: string;
  }
}
