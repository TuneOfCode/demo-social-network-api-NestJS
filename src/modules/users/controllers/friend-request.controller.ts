import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { env } from 'src/configs/common.config';
import { decoded } from 'src/helpers/common.helper';
import { IAuthCookie } from 'src/modules/auth/interfaces/auth.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { UpdateFriendRequestDto } from '../dto/friendRequest.dto';
import { EFriendRequestStatus } from '../interfaces/friendRequest.interface';
import { FriendRequestService } from '../services/friend-request.service';

@UseGuards(JwtAuthGuard)
@Controller('friend-request')
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Post('sent/:receiverId')
  async sent(
    @Param('receiverId', new ParseUUIDPipe()) receiverId: string,
    @Req() request: Request,
  ) {
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    return await this.friendRequestService.sent(currentUser.id, receiverId);
  }

  @Get()
  async findAll(@Query('status') status: EFriendRequestStatus) {
    if (status) return await this.friendRequestService.findAllByStatus(status);
    return await this.friendRequestService.findAll();
  }

  @Patch('received/:senderId')
  edit(
    @Param('senderId', new ParseUUIDPipe()) senderId: string,
    @Body() updateFriendRequestDto: UpdateFriendRequestDto,
    @Req() request: Request,
  ) {
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    return this.friendRequestService.update(
      senderId,
      updateFriendRequestDto,
      currentUser,
    );
  }

  @Patch('accept/:receiverId')
  accept(
    @Param('receiverId', new ParseUUIDPipe()) receiverId: string,
    @Req() request: Request,
  ) {
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    return this.friendRequestService.accept(currentUser.id, receiverId);
  }

  @Patch('cancel/:receiverId')
  cancel(
    @Param('receiverId', new ParseUUIDPipe()) receiverId: string,
    @Req() request: Request,
  ) {
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    return this.friendRequestService.cancel(currentUser.id, receiverId);
  }

  @Delete('destroy/:id')
  destroy(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.friendRequestService.destroy(id);
  }
}
