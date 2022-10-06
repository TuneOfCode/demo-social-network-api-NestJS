import { Module } from '@nestjs/common';
import { LinksPreviewService } from './services/links-preview.service';
import { LinksPreviewController } from './controllers/links-preview.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '../posts/entities/post.entity';
import { LinksPreviewEntity } from './entities/links-preview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, LinksPreviewEntity])],
  controllers: [LinksPreviewController],
  providers: [LinksPreviewService],
  exports: [LinksPreviewService],
})
export class LinksPreviewModule {}
