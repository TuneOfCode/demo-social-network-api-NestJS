import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { IFile } from 'src/modules/files/interfaces/file.interface';
import { ILinkPreview } from 'src/modules/links-preview/interfaces/links-preview.interface';
import { IUser } from 'src/modules/users/interfaces/user.interface';
import { EMode } from '../interfaces/post.interface';

export class CreatePostDto {
  @IsString()
  text: string;

  link?: ILinkPreview;

  @IsOptional()
  @IsString()
  hashtag: string;

  @IsOptional()
  @IsEnum(EMode, {
    each: true,
    message: `Mode include: ${EMode.PRIVATE} | ${EMode.PUBLIC_FRIENDS} | ${EMode.PUBLIC_EVERYONE}`,
  })
  mode: EMode;

  mediaFiles?: IFile[];

  author: IUser;
}
export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsString()
  text: string;

  link?: ILinkPreview;

  @IsOptional()
  @IsString()
  hashtag: string;

  @IsOptional()
  @IsBoolean()
  isComment: boolean;

  @IsOptional()
  @IsEnum(EMode, {
    each: true,
    message: `Mode include: ${EMode.PRIVATE} | ${EMode.PUBLIC_FRIENDS} | ${EMode.PUBLIC_EVERYONE}`,
  })
  mode: EMode;

  mediaFiles?: IFile[];

  author: IUser;
}
