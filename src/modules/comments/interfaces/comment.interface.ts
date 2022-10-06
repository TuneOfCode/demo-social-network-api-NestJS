import { IFile } from 'src/modules/files/interfaces/file.interface';
import { ILinkPreview } from 'src/modules/links-preview/interfaces/links-preview.interface';
import { IPost } from 'src/modules/posts/interfaces/post.interface';
import { IUser } from 'src/modules/users/interfaces/user.interface';

export interface IComment {
  id?: string;
  text: string;
  link?: ILinkPreview;
  mediaFiles?: IFile[];
  isShow: boolean;
  denounce: number;
  creator: IUser;
  post: IPost;
  childrentComments?: IComment[];
  parentComment?: IComment;
}
