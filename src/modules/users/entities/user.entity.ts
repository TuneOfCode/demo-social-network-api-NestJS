import { FileEntity } from 'src/modules/files/entities/file.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
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
    // eager: true,
  })
  @JoinColumn()
  avatar: FileEntity;

  @Column({ default: false })
  isDisabled: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
