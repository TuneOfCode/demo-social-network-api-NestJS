import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
<<<<<<< HEAD
<<<<<<< HEAD
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
=======
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
>>>>>>> 6c78765 ([FIX | ADD] Fix config & Add - Setup users - auth)
=======
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
>>>>>>> hotfix/auth
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

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

  @Delete('destroy/:uuid')
  remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.usersService.destroy(uuid);
  }
}
