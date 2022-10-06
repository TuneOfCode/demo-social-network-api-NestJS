import { CommentEntity } from 'src/modules/comments/entities/comment.entity';
import { IComment } from 'src/modules/comments/interfaces/comment.interface';
import { FileEntity } from 'src/modules/files/entities/file.entity';
import { LinksPreviewEntity } from 'src/modules/links-preview/entities/links-preview.entity';
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
  UpdateDateColumn,
} from 'typeorm';
import { EMode, IPost } from '../interfaces/post.interface';

@Entity({ name: 'posts' })
export class PostEntity implements IPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: '1000' })
  text: string;

  @OneToOne(() => LinksPreviewEntity, (link) => link.post, {
    cascade: ['remove'],
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  link?: LinksPreviewEntity;

  @RelationId((post: PostEntity) => post.link)
  linkId: string;

  @Column({ nullable: true })
  hashtag?: string;

  @Column({
    type: 'enum',
    enum: EMode,
  })
  mode: EMode;

  @Column({ default: true })
  isComment: boolean;

  @OneToMany(() => FileEntity, (files) => files.posts)
  mediaFiles?: FileEntity[];

  @RelationId((post: PostEntity) => post.mediaFiles)
  files: string[];

  @ManyToOne(() => UserEntity, (user) => user.posts, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  author: IUser;

  @OneToMany(() => CommentEntity, (comments) => comments.post)
  comments: IComment[];

  @RelationId((post: PostEntity) => post.author)
  authorId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
