import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { env } from 'src/configs/common.config';
import { CreateUserDto } from '../users/dto/user.dto';
import { IUser } from '../users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/auth.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const tokens = await this.generateToken(user);
    delete user.password;
    return {
      ...user,
      tokens: tokens,
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    return await this.generateToken(user);
  }

  async validateUser(email: string, password: string) {
    const checkUser = await this.usersService.findByEmail(email);
    if (!checkUser)
      throw new HttpException(
        `Email '${email}' does not exist`,
        HttpStatus.BAD_REQUEST,
      );
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

  async generateToken(user: IUser) {
    const payload = { email: user.email };
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
