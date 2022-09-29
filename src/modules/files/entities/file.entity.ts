import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
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

  @OneToOne(() => UserEntity, (user) => user.avatar)
  userRef: UserEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
