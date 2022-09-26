import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {} from '@nestjs/config';
import { IUser } from '../users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorator/user.decorator';
import { LoginUserDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.generateToken(loginUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: IUser) {
    return await this.usersService.findByEmail(user.email);
  }
}
