import { IsString } from 'class-validator';
import { ILoginUser } from '../interfaces/auth.interface';
export class LoginUserDto implements ILoginUser {
  @IsString()
  email: string;

  @IsString()
  password: string;
}
