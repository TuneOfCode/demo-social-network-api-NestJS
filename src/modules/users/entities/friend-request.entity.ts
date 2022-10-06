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
import {
  EFriendRequestStatus,
  IFriendRequest,
} from '../interfaces/friendRequest.interface';

@Entity({ name: 'friend_request' })
export class FriendRequestEntity implements IFriendRequest {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @ManyToOne(() => UserEntity, (user) => user.sentFriendRequests, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  sender: UserEntity;

  @RelationId((friend: FriendRequestEntity) => friend.sender)
  senderId: string;

  @ManyToOne(() => UserEntity, (user) => user.receivedFriendRequests, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  receiver: UserEntity;

  @RelationId((friend: FriendRequestEntity) => friend.receiver)
  receiverId: string;

  @Column({
    type: 'enum',
    enum: EFriendRequestStatus,
    default: EFriendRequestStatus.PENDING,
  })
  status: EFriendRequestStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
