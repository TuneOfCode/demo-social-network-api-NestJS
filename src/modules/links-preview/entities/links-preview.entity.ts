import { CommentEntity } from 'src/modules/comments/entities/comment.entity';
import { PostEntity } from 'src/modules/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ILinkPreview } from '../interfaces/links-preview.interface';

@Entity({ name: 'link_preview' })
export class LinksPreviewEntity implements ILinkPreview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: '1000' })
  url: string;

  @Column({ length: '500', nullable: true })
  title?: string;

  @Column({ length: '500', nullable: true })
  description?: string;

  @Column({ length: '500', nullable: true })
  thumbnail?: string;

  @Column({ length: '500', nullable: true })
  linkIframe?: string;

  @OneToOne(() => PostEntity, (post) => post.link, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  post: PostEntity;

  @OneToOne(() => CommentEntity, (comment) => comment.link, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  comment: CommentEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
