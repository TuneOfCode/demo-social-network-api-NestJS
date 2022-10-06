import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { FilesController } from './controllers/files.controller';
import { FileEntity } from './entities/file.entity';
import { FilesService } from './services/files.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity, UserEntity])],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
