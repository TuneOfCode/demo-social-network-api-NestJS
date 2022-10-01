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
  postId: string[];

  @Column({ default: false })
  isDisabled: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
