import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IComment } from 'src/modules/comments/interfaces/comment.interface';
import { IPost } from 'src/modules/posts/interfaces/post.interface';
import { IUser } from 'src/modules/users/interfaces/user.interface';
import { ESymbolEmotions } from '../interfaces/emotion.interface';

export class CreateEmotionDto {
  @IsEnum(ESymbolEmotions, {
    each: true,
    message: `Mode include: ${ESymbolEmotions.LIKE} | ${ESymbolEmotions.LOVE} | ${ESymbolEmotions.HAHA} | ${ESymbolEmotions.HAPPY} | ${ESymbolEmotions.DISLIKE} | ${ESymbolEmotions.HATE} | ${ESymbolEmotions.SAD} | ${ESymbolEmotions.ANGRY}`,
  })
  symbol: ESymbolEmotions;

  @IsString()
  creatorId: string;

  creator: IUser;

  @IsOptional()
  @IsString()
  postId: string;

  post: IPost;

  @IsOptional()
  @IsString()
  commentId: string;

  comment: IComment;
}
export class UpdateEmotionDto extends PartialType(CreateEmotionDto) {
  @IsEnum(ESymbolEmotions, {
    each: true,
    message: `Mode include: ${ESymbolEmotions.LIKE} | ${ESymbolEmotions.LOVE} | ${ESymbolEmotions.HAHA} | ${ESymbolEmotions.HAPPY} | ${ESymbolEmotions.DISLIKE} | ${ESymbolEmotions.HATE} | ${ESymbolEmotions.SAD} | ${ESymbolEmotions.ANGRY}`,
  })
  symbol: ESymbolEmotions;
}
