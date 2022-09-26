import { IsNotEmpty, IsString } from 'class-validator';
<<<<<<< HEAD
<<<<<<< HEAD
import { ILoginUser } from '../interface/auth.interface';
=======
import { ILoginUser } from '../interfaces/auth.interface';
>>>>>>> 6c78765 ([FIX | ADD] Fix config & Add - Setup users - auth)
=======
import { ILoginUser } from '../interfaces/auth.interface';
>>>>>>> hotfix/auth

export class LoginUserDto implements ILoginUser {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
