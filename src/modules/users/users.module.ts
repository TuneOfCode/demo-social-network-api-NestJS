import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '../files/files.module';
import { FriendRequestController } from './controllers/friend-request.controller';
import { UsersController } from './controllers/users.controller';
import { FriendRequestEntity } from './entities/friend-request.entity';
import { UserEntity } from './entities/user.entity';
import { FriendRequestService } from './services/friend-request.service';
import { UsersService } from './services/users.service';
import { IsEmailAlreadyExistContraint } from './validations/checkEmail.validation';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, FriendRequestEntity]),
    FilesModule,
  ],
  controllers: [UsersController, FriendRequestController],
  providers: [IsEmailAlreadyExistContraint, UsersService, FriendRequestService],
  exports: [UsersService, FriendRequestService],
})
export class UsersModule {}
