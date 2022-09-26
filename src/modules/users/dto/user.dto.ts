import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
<<<<<<< HEAD
<<<<<<< HEAD
import { IUser } from '../interface/user.interface';
=======
import { IUser } from '../interfaces/user.interface';
>>>>>>> 6c78765 ([FIX | ADD] Fix config & Add - Setup users - auth)
=======
import { IUser } from '../interfaces/user.interface';
>>>>>>> hotfix/auth

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
