import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { FilesService } from '../services/files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('')
  findAll() {
    return this.filesService.findAll();
  }

  @Get('detail/:uuid')
  findByFileName(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.filesService.findByFileName(uuid);
  }
}
