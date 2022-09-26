import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { env } from 'src/configs/common.config';
<<<<<<< HEAD
<<<<<<< HEAD
import { IUser } from '../users/interface/user.interface';
=======
import { IUser } from '../users/interfaces/user.interface';
>>>>>>> 6c78765 ([FIX | ADD] Fix config & Add - Setup users - auth)
=======
import { IUser } from '../users/interfaces/user.interface';
>>>>>>> hotfix/auth
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/auth.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const checkUser = await this.usersService.findByEmail(email);
    const isMatchPassword = await bcrypt.compare(password, checkUser.password);
    if (!checkUser) {
      throw new HttpException(
        `Email ${email} doesn't exist`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (!isMatchPassword) {
      throw new HttpException(`Incorrect password`, HttpStatus.UNAUTHORIZED);
    }
    return checkUser;
  }

  async generateToken(loginUserDto: Partial<IUser>) {
    const payload = { email: loginUserDto.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: env.JWT_SIGNATURE,
      expiresIn: env.JWT_ACCESS_TOKEN_EXPIES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: env.JWT_SIGNATURE,
      expiresIn: env.JWT_REFRESH_TOKEN_EXPIES_IN,
    });
    return {
      accessToken,
      refreshToken,
    };
  }
}
