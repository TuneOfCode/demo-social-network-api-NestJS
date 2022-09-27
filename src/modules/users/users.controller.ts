import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UpdateUserDto } from './dto/user.dto';
import { UsersService } from './users.service';

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

  @Delete('destroy/:uuid')
  remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.usersService.destroy(uuid);
  }
}
