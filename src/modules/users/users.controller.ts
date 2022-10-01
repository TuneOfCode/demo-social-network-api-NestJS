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
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { IAuthCookie } from '../auth/interfaces/auth.interface';
import { UpdateFileDto } from '../files/dto/file.dto';
import { FilesService } from '../files/files.service';
import { UpdateUserDto } from './dto/user.dto';
import { UsersService } from './users.service';
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('detail/:uuid')
  findById(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.usersService.findById(uuid);
  }

  @Patch('edit/:uuid')
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
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    if (currentUser.id !== uuid)
      throw new HttpException(
        'Do not have permission to access this resource',
        HttpStatus.FORBIDDEN,
      );
    const checkUserWithId = await this.usersService.findById(uuid);
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
    return await this.usersService.update(uuid, updateUserDto);
  }

  @Patch('disable/:uuid')
  disable(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    if (currentUser.id !== uuid)
      throw new HttpException(
        'Do not have permission to access this resource',
        HttpStatus.FORBIDDEN,
      );
    response.clearCookie(env.JWT_COOKIE);
    return this.usersService.disable(uuid);
  }

  @Patch('restore/:uuid')
  restore(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Req() request: Request,
  ) {
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    if (currentUser.id !== uuid)
      throw new HttpException(
        'Do not have permission to access this resource',
        HttpStatus.FORBIDDEN,
      );
    return this.usersService.restore(uuid);
  }

  @Delete('destroy/:uuid')
  async remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    const checkUserWithId = await this.usersService.findById(uuid);
    const avatarPath = `${join(process.cwd())}/${env.APP_ROOT_STORAGE}${
      storageOfUploadFile.user
    }/${checkUserWithId.avatar.fileName}`;
    fs.unlink(avatarPath, (error) => {
      return error;
    });
    return await this.usersService.destroy(uuid);
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
