import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { env } from 'src/configs/common.config';
import { UsersService } from 'src/modules/users/services/users.service';
import { CreateUserDto } from '../../users/dto/user.dto';
import { IUser } from '../../users/interfaces/user.interface';
import { LoginUserDto } from '../dto/auth.dto';

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
      ...tokens,
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    const tokens = await this.generateToken(user);
    await this.usersService.restore(user.id);
    return {
      id: user.id,
      ...tokens,
    };
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
      secret: env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: env.JWT_ACCESS_TOKEN_EXPIES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: env.JWT_REFRESH_TOKEN_EXPIES_IN,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async updateAccessToken(refreshTokenInCookie: string) {
    try {
      const decode = this.jwtService.verify(refreshTokenInCookie, {
        secret: env.JWT_REFRESH_TOKEN_SECRET,
      });
      if (!decode) throw new BadRequestException('Refresh token has expired');
      const newAccessToken = (await this.generateToken(decode)).accessToken;
      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid refresh token');
    }
  }

  async getMe(user: IUser) {
    let checkUserWithEmail = await this.usersService.findByEmail(user.email);
    if (!checkUserWithEmail) throw new UnauthorizedException();
    delete checkUserWithEmail.password;
    checkUserWithEmail = {
      ...checkUserWithEmail,
      postIds: checkUserWithEmail.posts.map((item) => item.id),
      avatarImg: checkUserWithEmail.avatar?.fileName,
    };
    delete checkUserWithEmail.avatar;
    delete checkUserWithEmail.posts;

    return checkUserWithEmail;
  }
}
