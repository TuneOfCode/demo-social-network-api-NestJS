import { IComment } from 'src/modules/comments/interfaces/comment.interface';
import { IPost } from 'src/modules/posts/interfaces/post.interface';
import { IUser } from 'src/modules/users/interfaces/user.interface';

export enum ESymbolEmotions {
  LIKE = 'like',
  LOVE = 'love',
  HAHA = 'haha',
  HAPPY = 'happy',
  DISLIKE = 'dislike',
  HATE = 'hate',
  SAD = 'sad',
  ANGRY = 'angry',
}

export interface IEmotion {
  id?: string;
  symbol: ESymbolEmotions;
  creator: IUser;
  post?: IPost;
  comment?: IComment;
}
