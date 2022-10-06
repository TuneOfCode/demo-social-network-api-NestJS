import { Module } from '@nestjs/common';
import { CommentsService } from './services/comments.service';
import { CommentsController } from './controllers/comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinksPreviewEntity } from '../links-preview/entities/links-preview.entity';
import { FileEntity } from '../files/entities/file.entity';
import { UserEntity } from '../users/entities/user.entity';
import { PostEntity } from '../posts/entities/post.entity';
import { CommentEntity } from './entities/comment.entity';
import { FilesModule } from '../files/files.module';
import { LinksPreviewModule } from '../links-preview/links-preview.module';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LinksPreviewEntity,
      FileEntity,
      UserEntity,
      PostEntity,
      CommentEntity,
    ]),
    FilesModule,
    LinksPreviewModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
