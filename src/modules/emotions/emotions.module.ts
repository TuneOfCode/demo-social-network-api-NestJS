import { Module } from '@nestjs/common';
import { EmotionsService } from './services/emotions.service';
import { EmotionsController } from './controllers/emotions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmotionEntity } from './entities/emotion.entity';
import { UserEntity } from '../users/entities/user.entity';
import { PostEntity } from '../posts/entities/post.entity';
import { CommentEntity } from '../comments/entities/comment.entity';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmotionEntity,
      UserEntity,
      PostEntity,
      CommentEntity,
    ]),
    UsersModule,
    PostsModule,
    CommentsModule,
  ],
  controllers: [EmotionsController],
  providers: [EmotionsService],
  exports: [EmotionsService],
})
export class EmotionsModule {}
