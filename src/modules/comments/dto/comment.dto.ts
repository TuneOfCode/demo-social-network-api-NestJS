import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { IFile } from 'src/modules/files/interfaces/file.interface';
import { ILinkPreview } from 'src/modules/links-preview/interfaces/links-preview.interface';
import { IPost } from 'src/modules/posts/interfaces/post.interface';
import { IUser } from 'src/modules/users/interfaces/user.interface';
import { IComment } from '../interfaces/comment.interface';

export class CreateCommentDto {
  @IsString()
  text: string;

  link?: ILinkPreview;

  mediaFiles?: IFile[];

  @IsOptional()
  @IsString()
  creatorId: string;

  creator: IUser;

  @IsString()
  postId: string;

  post: IPost;

  childrentComments?: IComment[];

  @IsOptional()
  @IsString()
  parentCommentId: string;

  parentComment?: IComment;
}
export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @IsString()
  text: string;

  link?: ILinkPreview;

  mediaFiles?: IFile[];

  @IsOptional()
  @IsBoolean()
  isShow: boolean;

  @IsOptional()
  @IsNumber()
  denounce: number;

  creator: IUser;

  post: IPost;

  childrentComments?: IComment[];

  parentComment?: IComment;
}
