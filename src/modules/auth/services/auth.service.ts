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
    if (!isMatchPassword) {
      throw new HttpException(`Incorrect password`, HttpStatus.BAD_REQUEST);
    }

    return checkUser;
  }

  async generateToken(user: IUser) {
    const { email, fullname, id, isDisabled } = user;
    const payload = {
      email,
      fullname,
      id,
      isDisabled,
    };
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

  async getUserFromAuthToken(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: env.JWT_REFRESH_TOKEN_SECRET,
    });
    if (!payload) throw new BadRequestException('Token does not exist');
    const authUser = await this.usersService.findById(payload?.id);
    return authUser;
  }

  async updateAccessToken(refreshTokenInCookie: string) {
    try {
      const decode = await this.getUserFromAuthToken(refreshTokenInCookie);
      const newAccessToken = (await this.generateToken(decode)).accessToken;
      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid token');
    }
  }

  async getMe(user: IUser) {
    let checkUserWithEmail = await this.usersService.findByEmail(user.email);
    if (!checkUserWithEmail) throw new UnauthorizedException();

    checkUserWithEmail = {
      ...checkUserWithEmail,
      postIds: checkUserWithEmail.posts.map((item) => item.id),
      avatarImg: checkUserWithEmail.avatar?.fileName,
    };

    delete checkUserWithEmail?.avatar;
    delete checkUserWithEmail?.password;
    delete checkUserWithEmail?.posts;
    delete checkUserWithEmail?.comments;
    delete checkUserWithEmail?.sentFriendRequests;
    delete checkUserWithEmail?.receivedFriendRequests;
    delete checkUserWithEmail?.emotions;

    return checkUserWithEmail;
  }
}
