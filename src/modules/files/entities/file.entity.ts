import { CommentEntity } from 'src/modules/comments/entities/comment.entity';
import { PostEntity } from 'src/modules/posts/entities/post.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IFile } from '../interfaces/file.interface';

@Entity({ name: 'files' })
export class FileEntity implements IFile {
  @PrimaryColumn({ length: '200' })
  fileName: string;

  @Column({ length: '1000' })
  fileUrl: string;

  @Column({ nullable: true })
  size?: number;

  @Column({ nullable: true })
  type?: string;

  @OneToOne(() => UserEntity, (user) => user.avatar, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  userRef: UserEntity;

  @ManyToOne(() => PostEntity, (posts) => posts.mediaFiles, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  posts: PostEntity[];

  @ManyToOne(() => CommentEntity, (comment) => comment.mediaFiles, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  comments: CommentEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
