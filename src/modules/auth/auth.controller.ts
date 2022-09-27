import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { env } from 'src/configs/common.config';
import { CreateUserDto } from '../users/dto/user.dto';
import { IUser } from '../users/interfaces/user.interface';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorator/user.decorator';
import { LoginUserDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.login(loginUserDto);
    response.cookie(env.JWT_COOKIE, user, { httpOnly: true });
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: IUser) {
    return this.authService.getMe(user);
  }
}
