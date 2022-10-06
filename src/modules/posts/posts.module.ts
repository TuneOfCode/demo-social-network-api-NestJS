import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '../files/entities/file.entity';
import { FilesModule } from '../files/files.module';
import { LinksPreviewModule } from '../links-preview/links-preview.module';
import { UserEntity } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { PostEntity } from './entities/post.entity';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './services/posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, UserEntity, FileEntity]),
    UsersModule,
    FilesModule,
    LinksPreviewModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
