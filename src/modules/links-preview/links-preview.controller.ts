import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  CreateLinksPreviewDto,
  UpdateLinksPreviewDto,
} from './dto/links-preview.dto';
import { LinksPreviewService } from './links-preview.service';

@Controller('links-preview')
export class LinksPreviewController {
  constructor(private readonly linksPreviewService: LinksPreviewService) {}
}
