import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Req } from '@nestjs/common/decorators';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { Request } from 'express';
import { env } from 'src/configs/common.config';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UpdateUserDto } from './dto/user.dto';
import { IUser } from './interfaces/user.interface';
import { UsersService } from './users.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('detail/:uuid')
  findById(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.usersService.findById(uuid);
  }

  @Patch('edit/:uuid')
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(uuid, updateUserDto);
  }

  @Patch('disable/:uuid')
  disable(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Req() request: Request,
  ) {
    const currentUser: Partial<IUser> = request.cookies[env.JWT_COOKIE];
    if (currentUser.id !== uuid)
      throw new HttpException(
        'Do not have permission to access this resource',
        HttpStatus.FORBIDDEN,
      );
    return this.usersService.disable(uuid);
  }

  @Patch('restore/:uuid')
  restore(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Req() request: Request,
  ) {
    const currentUser: Partial<IUser> = request.cookies[env.JWT_COOKIE];
    if (currentUser.id !== uuid)
      throw new HttpException(
        'Do not have permission to access this resource',
        HttpStatus.FORBIDDEN,
      );
    return this.usersService.restore(uuid);
  }

  @Delete('destroy/:uuid')
  remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.usersService.destroy(uuid);
  }
}
