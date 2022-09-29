import { Controller, Get, Param } from '@nestjs/common';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('')
  findAll() {
    return this.filesService.findAll();
  }

  @Get('detail/:uuid')
  findByFileName(@Param('uuid') uuid: string) {
    return this.filesService.findByFileName(uuid);
  }
}
