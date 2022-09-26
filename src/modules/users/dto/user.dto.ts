import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { IUser } from '../interface/user.interface';

export class CreateUserDto implements IUser {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(5)
  password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) implements IUser {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(5)
  password: string;
}
