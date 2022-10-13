import { CommentEntity } from 'src/modules/comments/entities/comment.entity';
import { PostEntity } from 'src/modules/posts/entities/post.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { ESymbolEmotions, IEmotion } from '../interfaces/emotion.interface';

@Entity({ name: 'emotions' })
export class EmotionEntity implements IEmotion {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'enum', enum: ESymbolEmotions })
  symbol: ESymbolEmotions;

  @ManyToOne(() => UserEntity, (user) => user.emotions)
  @JoinColumn()
  creator: UserEntity;

  @RelationId((emotion: EmotionEntity) => emotion.creator)
  creatorId: string;

  @ManyToOne(() => PostEntity, (post) => post.emotions)
  @JoinColumn()
  post: PostEntity;

  @RelationId((emotion: EmotionEntity) => emotion.post)
  postId: string;

  @ManyToOne(() => CommentEntity, (comment) => comment.emotions)
  @JoinColumn()
  comment?: CommentEntity;

  @RelationId((emotion: EmotionEntity) => emotion.comment)
  commentId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
