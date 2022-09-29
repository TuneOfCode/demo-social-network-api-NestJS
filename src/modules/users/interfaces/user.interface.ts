import { FileEntity } from 'src/modules/files/entities/file.entity';
import { IFile } from 'src/modules/files/interfaces/file.interface';

export interface IUser {
  id?: string;
  fullname: string;
  email: string;
  password: string;
  avatar?: IFile;
  isDisabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
