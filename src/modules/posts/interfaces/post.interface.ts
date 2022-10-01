import { IFile } from 'src/modules/files/interfaces/file.interface';
import { LinksPreviewEntity } from 'src/modules/links-preview/entities/links-preview.entity';
import { IUser } from 'src/modules/users/interfaces/user.interface';

export enum EMode {
  PRIVATE = 'private',
  PUBLIC_FRIENDS = 'public to friends',
  PUBLIC_EVERYONE = 'public to everyone',
}
export interface IPost {
  id: string;
  text: string;
  link?: LinksPreviewEntity;
  hashtag?: string;
  mode: EMode;
  mediaFiles?: IFile[];
  author: IUser;
}
