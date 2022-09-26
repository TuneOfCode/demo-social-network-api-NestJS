import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
<<<<<<< HEAD
import { IUser } from '../interface/user.interface';
=======
import { IUser } from '../interfaces/user.interface';
>>>>>>> 6c78765 ([FIX | ADD] Fix config & Add - Setup users - auth)

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

  @Column({
    nullable: true,
    length: '5000',
    default:
      'https://scontent.fhan14-3.fna.fbcdn.net/v/t1.30497-1/143086968_2856368904622192_1959732218791162458_n.png?_nc_cat=1&ccb=1-7&_nc_sid=7206a8&_nc_ohc=AUCBojK_Ff4AX_Oz5-5&_nc_ht=scontent.fhan14-3.fna&oh=00_AT-tH0QGuBNKDfvOD4mw-uzZBf-cwTou0xHkYvrDiaJsIg&oe=6358D9F8',
  })
  avatarUrl: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
