import { IUser } from 'src/modules/users/interfaces/user.interface';

export enum EFriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  CANCELED = 'canceled',
}
export interface IFriendRequest {
  id?: string;
  sender: IUser;
  receiver: IUser;
  status: EFriendRequestStatus;
}
