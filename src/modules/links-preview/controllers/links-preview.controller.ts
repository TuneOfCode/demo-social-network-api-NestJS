import { Controller } from '@nestjs/common';
import { LinksPreviewService } from '../services/links-preview.service';

@Controller('links-preview')
export class LinksPreviewController {
  constructor(private readonly linksPreviewService: LinksPreviewService) {}
}
