import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { file } from './configs/common.config';
import { typeOrmConfig } from './configs/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FilesModule } from './modules/files/files.module';
import { PostsModule } from './modules/posts/posts.module';
import { LinksPreviewModule } from './modules/links-preview/links-preview.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: file.dev,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    AuthModule,
    FilesModule,
    PostsModule,
    LinksPreviewModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
