declare namespace NodeJS {
  export interface ProcessEnv {
    DB_HOST?: string;
    DB_PORT?: string;
    DB_USERNAME?: string;
    DB_PASSWORD?: string;
    DB_DATABASE?: string;
    JWT_SIGNATURE?: string;
    JWT_ACCESS_TOKEN_EXPIES_IN?: string;
    JWT_REFRESH_TOKEN_EXPIES_IN?: string;
  }
}
