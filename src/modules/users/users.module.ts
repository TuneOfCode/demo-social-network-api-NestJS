import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { IsEmailAlreadyExistContraint } from './validations/checkEmail.validation';
import { FilesModule } from '../files/files.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), FilesModule],
  controllers: [UsersController],
  providers: [IsEmailAlreadyExistContraint, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
