import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {} from '@nestjs/config';
<<<<<<< HEAD
import { IUser } from '../users/interface/user.interface';
=======
import { IUser } from '../users/interfaces/user.interface';
>>>>>>> 6c78765 ([FIX | ADD] Fix config & Add - Setup users - auth)
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorator/user.decorator';
import { LoginUserDto } from './dto/auth.dto';
<<<<<<< HEAD
import { JwtAuthGuard } from './guard/jwt.guard';
import { LocalAuthGuard } from './guard/local.guard';
=======
import { JwtAuthGuard } from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local.guard';
>>>>>>> 6c78765 ([FIX | ADD] Fix config & Add - Setup users - auth)

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
