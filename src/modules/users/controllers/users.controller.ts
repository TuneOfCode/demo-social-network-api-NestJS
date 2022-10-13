import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { join } from 'path';
import { of } from 'rxjs';
import { env, storageOfUploadFile } from 'src/configs/common.config';
import { decoded } from 'src/helpers/common.helper';
import { CustomFileInterceptor } from 'src/interceptors/uploadFile.interceptor';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { IAuthCookie } from 'src/modules/auth/interfaces/auth.interface';
import { UpdateFileDto } from 'src/modules/files/dto/file.dto';
import { FilesService } from 'src/modules/files/services/files.service';
import { UpdateUserDto } from '../dto/user.dto';
import { FriendRequestService } from '../services/friend-request.service';
import { UsersService } from '../services/users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
    private readonly friendRequestService: FriendRequestService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('list-friends')
  async listFriends(@Req() request: Request, @Query('userId') userId: string) {
    if (userId)
      return await this.friendRequestService.listFriendsOfUser(userId);
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    return await this.friendRequestService.listFriendsOfUser(currentUser.id);
  }
  @Get('list-friends/:userId')
  async findAFriendOfUser(
    @Req() request: Request,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    return await this.friendRequestService.findAFriendOfUser(
      currentUser.id,
      userId,
    );
  }

  @Get('detail/:userId')
  findById(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch('edit/:userId')
  @UseInterceptors(
    CustomFileInterceptor({
      typeUpload: 'single',
      fieldName: 'avatar',
      maxCount: null,
      selectExt: 'image',
      localStoragePath: storageOfUploadFile.user,
    }),
  )
  async update(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    if (currentUser.id !== userId)
      throw new HttpException(
        'Do not have permission to access this resource',
        HttpStatus.FORBIDDEN,
      );
    const checkUserWithId = await this.usersService.findById(userId);
    if (file) {
      const editFile: UpdateFileDto = {
        fileName: file.filename,
        fileUrl: `${env.APP_DOMAIN}/users/avatar/${file.filename}`,
        size: file.size,
        type: file.mimetype,
      };
      updateUserDto.avatar = editFile;
      console.log('Edit File Upload: ', editFile);
      // delete old avatar (when deploy will keep)
      if (checkUserWithId.avatar) {
        console.log(
          'checkUserWithId.avatar?.fileName: ',
          checkUserWithId.avatar.fileName,
        );
        if (checkUserWithId.avatar && checkUserWithId.avatar?.fileName) {
          const avatarPath = `${join(process.cwd())}/${env.APP_ROOT_STORAGE}${
            storageOfUploadFile.user
          }/${checkUserWithId.avatar.fileName}`;
          fs.unlink(avatarPath, (error) => {
            return error;
          });
        }
      }
    }
    return await this.usersService.update(userId, updateUserDto);
  }

  @Patch('disable/:userId')
  disable(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    if (currentUser.id !== userId)
      throw new HttpException(
        'Do not have permission to access this resource',
        HttpStatus.FORBIDDEN,
      );
    response.clearCookie(env.JWT_COOKIE);
    return this.usersService.disable(userId);
  }

  @Patch('restore/:userId')
  restore(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Req() request: Request,
  ) {
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    if (currentUser.id !== userId)
      throw new HttpException(
        'Do not have permission to access this resource',
        HttpStatus.FORBIDDEN,
      );
    return this.usersService.restore(userId);
  }

  @Delete('destroy/:userId')
  async remove(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    const checkUserWithId = await this.usersService.findById(userId);
    if (checkUserWithId.avatar) {
      const avatarPath = `${join(process.cwd())}/${env.APP_ROOT_STORAGE}${
        storageOfUploadFile.user
      }/${checkUserWithId.avatar.fileName}`;
      fs.unlink(avatarPath, (error) => {
        return error;
      });
    }
    response.clearCookie(env.JWT_COOKIE, { httpOnly: true });
    return await this.usersService.destroy(userId, currentUser);
  }

  @Get('avatar/:fileName')
  async getAvatar(@Param('fileName') fileName: string, @Res() response) {
    try {
      const avatarUrl = `${join(process.cwd())}/${env.APP_ROOT_STORAGE}${
        storageOfUploadFile.user
      }/${fileName}`;
      const checkFileWithFileName = await this.filesService.findByFileName(
        fileName,
      );
      if (!checkFileWithFileName) {
        throw new NotFoundException('Avatar does not found');
      }
      return of(response.sendFile(avatarUrl));
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
