import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFileDto, UpdateFileDto } from './dto/file.dto';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
  ) {}
  async create(createFileDto: CreateFileDto) {
    const checkFileWithFileName = await this.filesRepository.findOne({
      where: { fileName: createFileDto.fileName },
    });
    if (checkFileWithFileName)
      throw new HttpException(
        `File '${createFileDto.fileName}' already exist`,
        HttpStatus.CONFLICT,
      );
    const newFiles = await this.filesRepository.create(createFileDto);
    return await this.filesRepository.save(newFiles);
  }

  async findAll() {
    return await this.filesRepository.find();
  }

  async findByFileName(fileName: string) {
    const checkFileWithFileName = await this.filesRepository.findOne({
      where: { fileName: fileName },
      relations: ['userRef'],
    });
    if (!checkFileWithFileName)
      throw new HttpException('File does not found', HttpStatus.NOT_FOUND);
    return checkFileWithFileName;
  }

  async update(fileName: string, updateFileDto: UpdateFileDto) {
    const checkFileWithFileName = await this.findByFileName(fileName);
    if (!checkFileWithFileName)
      throw new HttpException('File does not exist', HttpStatus.BAD_REQUEST);
    return await this.filesRepository.update(fileName, updateFileDto);
  }

  async destroy(fileName: string) {
    const checkFileWithFileName = await this.findByFileName(fileName);
    if (!checkFileWithFileName)
      throw new HttpException('File does not exist', HttpStatus.BAD_REQUEST);
    return await this.filesRepository.delete(fileName);
  }
}
