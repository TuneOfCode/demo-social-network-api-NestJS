import { EmotionEntity } from 'src/modules/emotions/entities/emotion.entity';
import { FileEntity } from 'src/modules/files/entities/file.entity';
import { IFile } from 'src/modules/files/interfaces/file.interface';
import { LinksPreviewEntity } from 'src/modules/links-preview/entities/links-preview.entity';
import { ILinkPreview } from 'src/modules/links-preview/interfaces/links-preview.interface';
import { PostEntity } from 'src/modules/posts/entities/post.entity';
import { IPost } from 'src/modules/posts/interfaces/post.interface';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { IUser } from 'src/modules/users/interfaces/user.interface';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { IComment } from '../interfaces/comment.interface';

@Entity({ name: 'comments' })
@Tree('closure-table')
export class CommentEntity implements IComment {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ length: '1000' })
  text: string;

  @OneToOne(() => LinksPreviewEntity, (link) => link.comment)
  @JoinColumn()
  link?: LinksPreviewEntity;

  @RelationId((comments: CommentEntity) => comments.link)
  linkId: string;

  @OneToMany(() => FileEntity, (files) => files.comments)
  mediaFiles?: IFile[];

  @RelationId((comments: CommentEntity) => comments.mediaFiles)
  files: string[];

  @Column({ default: true })
  isShow: boolean;

  @Column({ default: 0 })
  denounce: number;

  @ManyToOne(() => UserEntity, (user) => user.comments, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  creator: UserEntity;

  @RelationId((comments: CommentEntity) => comments.creator)
  creatorId: string;

  @ManyToOne(() => PostEntity, (post) => post.comments, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  post: PostEntity;

  @RelationId((comments: CommentEntity) => comments.post)
  postId: string;

  @OneToMany(() => EmotionEntity, (emotions) => emotions.comment)
  emotions: EmotionEntity[];

  @RelationId((comments: CommentEntity) => comments.emotions)
  emotionIds: string[];

  @TreeChildren({ cascade: true })
  childrentComments: CommentEntity[];

  @TreeParent({ onDelete: 'CASCADE' })
  parentComment: CommentEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
