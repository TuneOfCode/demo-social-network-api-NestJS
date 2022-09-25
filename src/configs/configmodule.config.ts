import { ConfigModuleOptions } from '@nestjs/config';

export const configModuleConfig: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: process.env.APP_PATH_ENV,
};
