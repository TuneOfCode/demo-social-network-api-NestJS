import { IFile } from 'src/modules/files/interfaces/file.interface';
import { ILinkPreview } from 'src/modules/links-preview/interfaces/links-preview.interface';
import { IUser } from 'src/modules/users/interfaces/user.interface';

export enum EMode {
  PRIVATE = 'private',
  PUBLIC_FRIENDS = 'public to friends',
  PUBLIC_EVERYONE = 'public to everyone',
}
export interface IPost {
  id: string;
  text: string;
  link?: ILinkPreview;
  hashtag?: string;
  mode: EMode;
  mediaFiles?: IFile[];
  author: IUser;
}
