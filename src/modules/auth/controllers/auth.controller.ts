import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { env, storageOfUploadFile } from 'src/configs/common.config';
import { decoded, encoded } from 'src/helpers/common.helper';
import { CustomFileInterceptor } from 'src/interceptors/uploadFile.interceptor';
import { FilesService } from 'src/modules/files/services/files.service';
import { CreateFileDto } from '../../files/dto/file.dto';
import { CreateUserDto } from '../../users/dto/user.dto';
import { IUser } from '../../users/interfaces/user.interface';
import { CurrentUser } from '../decorator/user.decorator';
import { LoginUserDto } from '../dto/auth.dto';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { LocalAuthGuard } from '../guards/local.guard';
import { IAuthCookie } from '../interfaces/auth.interface';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly filesService: FilesService,
  ) {}

  @Post('register')
  @UseInterceptors(
    CustomFileInterceptor({
      typeUpload: 'single',
      fieldName: 'avatar',
      maxCount: null,
      selectExt: 'image',
      localStoragePath: storageOfUploadFile.user,
    }),
  )
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (file) {
      const newFile: CreateFileDto = {
        fileName: file.filename,
        fileUrl: `${env.APP_DOMAIN}/users/avatar/${file.filename}`,
        size: file.size,
        type: file.mimetype,
      };
      createUserDto.avatar = newFile;
      console.log('New File Upload: ', newFile);
      await this.filesService.create(createUserDto.avatar);
    }
    const userCreated = await this.authService.register(createUserDto);
    const user: IAuthCookie = {
      id: userCreated.id,
      accessToken: userCreated.accessToken,
      refreshToken: userCreated.refreshToken,
    };
    response.cookie(env.JWT_COOKIE, encoded(user), { httpOnly: true });
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.login(loginUserDto);
    response.cookie(env.JWT_COOKIE, encoded(user), { httpOnly: true });
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(env.JWT_COOKIE, { httpOnly: true });
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  async getNewAccessToken(@Body() body: any, @Req() request: Request) {
    const authCookie: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    if (
      body.refreshTokenInLogin &&
      body.refreshTokenInLogin !== authCookie.refreshToken
    ) {
      throw new BadRequestException('Incorrect refresh token');
    }
    const payload = await this.authService.getUserFromAuthToken(
      authCookie.accessToken,
    );

    console.log('payload: ', payload);
    // console.log('authCookie: ', authCookie);
    // const token = request.headers.authorization;
    // console.log('token: ', token);
    return await this.authService.updateAccessToken(body.refreshTokenInLogin);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: IUser, @Req() request: Request) {
    console.log('user: ', user);
    const token = request.headers.authorization;
    console.log('token: ', token);
    return await this.authService.getMe(user);
  }
}
