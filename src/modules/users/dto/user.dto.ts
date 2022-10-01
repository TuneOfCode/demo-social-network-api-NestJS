import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { IFile } from 'src/modules/files/interfaces/file.interface';
import { IUser } from '../interfaces/user.interface';

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

  avatar?: IFile;
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

  avatar?: IFile;
}
