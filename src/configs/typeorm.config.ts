import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { env } from './common.config';

export const dataSourceOptions: MysqlConnectionOptions = {
  type: env.DB_TYPE as any,
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  entities: [__dirname + '/../**/*.entity{.ts}'],
};
export const typeOrmConfig: TypeOrmModuleOptions = {
  ...dataSourceOptions,
  autoLoadEntities: true,
  synchronize: true,
  migrations: ['src/database/migrations/*.ts', 'dist/migrations/*{.ts,.js}'],
  migrationsTableName: 'custom_migration_table',
  migrationsRun: false,
};

export const dataSource = new DataSource(dataSourceOptions);
