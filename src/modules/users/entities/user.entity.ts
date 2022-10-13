import { CommentEntity } from 'src/modules/comments/entities/comment.entity';
import { EmotionEntity } from 'src/modules/emotions/entities/emotion.entity';
import { FileEntity } from 'src/modules/files/entities/file.entity';
import { PostEntity } from 'src/modules/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { IUser } from '../interfaces/user.interface';
import { FriendRequestEntity } from './friend-request.entity';

@Entity({ name: 'users' })
export class UserEntity implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: '100' })
  fullname: string;

  @Column({ unique: true })
  email: string;

  @Column() // { select: false }
  password: string;

  @OneToOne(() => FileEntity, (file) => file.userRef, {
    cascade: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  avatar: FileEntity;

  @RelationId((user: UserEntity) => user.avatar)
  avatarImg: string;

  @OneToMany(() => PostEntity, (posts) => posts.author)
  posts: PostEntity[];

  @RelationId((user: UserEntity) => user.posts)
  postIds: string[];

  @OneToMany(() => CommentEntity, (comments) => comments.creator)
  comments: CommentEntity[];

  @RelationId((user: UserEntity) => user.comments)
  commentIds: string[];

  @OneToMany(() => FriendRequestEntity, (friends) => friends.sender)
  sentFriendRequests: FriendRequestEntity[];

  @RelationId((user: UserEntity) => user.sentFriendRequests)
  senderIds: string[];

  @OneToMany(() => FriendRequestEntity, (friends) => friends.receiver)
  receivedFriendRequests: FriendRequestEntity[];

  @RelationId((user: UserEntity) => user.receivedFriendRequests)
  receiverIds: string[];

  @OneToMany(() => EmotionEntity, (emotions) => emotions.creator)
  emotions: EmotionEntity[];

  @RelationId((user: UserEntity) => user.emotions)
  emotionIds: string[];

  @Column({ default: false })
  isDisabled: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
