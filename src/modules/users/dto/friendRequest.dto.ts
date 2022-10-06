import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IUser } from 'src/modules/users/interfaces/user.interface';
import { EFriendRequestStatus } from '../interfaces/friendRequest.interface';

export class CreateFriendRequestDto {
  @IsOptional()
  @IsString()
  senderId: string;

  sender: IUser;

  @IsOptional()
  @IsString()
  receiverId: string;

  receiver: IUser;
}
export class UpdateFriendRequestDto extends PartialType(
  CreateFriendRequestDto,
) {
  @IsString()
  senderId: string;

  sender: IUser;

  @IsString()
  receiverId: string;

  receiver: IUser;

  @IsEnum(EFriendRequestStatus, {
    each: true,
    message: `Mode include: ${EFriendRequestStatus.ACCEPTED} | ${EFriendRequestStatus.CANCELED}`,
  })
  status: EFriendRequestStatus;
}
