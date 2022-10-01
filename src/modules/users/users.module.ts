import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '../files/files.module';
import { PostsModule } from '../posts/posts.module';
import { UserEntity } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { IsEmailAlreadyExistContraint } from './validations/checkEmail.validation';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), FilesModule],
  controllers: [UsersController],
  providers: [IsEmailAlreadyExistContraint, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
