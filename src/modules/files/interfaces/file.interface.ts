import { IUser } from 'src/modules/users/interfaces/user.interface';

export interface IFile {
  fileName: string;
  fileUrl: string;
  size?: number;
  type?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
