import { IsNotEmpty, IsString } from 'class-validator';
import { ILoginUser } from '../interfaces/auth.interface';
export class LoginUserDto implements ILoginUser {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
