export interface IUser {
  id?: string;
  fullname: string;
  email: string;
  password: string;
  avatarUrl?: string;
  isDisabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
