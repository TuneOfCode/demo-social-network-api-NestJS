import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import * as dotenv from 'dotenv';
import configuration from './common.config';

dotenv.config({
  path: configuration.pathEnv,
});
export const dataSourceOptions: MysqlConnectionOptions = {
  type: process.env.DB_TYPE as any,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../**/*.entity{.ts}'],
  synchronize: true,
  logging: false,
};
export const typeOrmConfig: TypeOrmModuleOptions = {
  ...dataSourceOptions,
  autoLoadEntities: true,
  migrations: ['src/database/migrations/*.ts', 'dist/migrations/*{.ts,.js}'],
  migrationsTableName: 'custom_migration_table',
};

export const dataSource = new DataSource(dataSourceOptions);
