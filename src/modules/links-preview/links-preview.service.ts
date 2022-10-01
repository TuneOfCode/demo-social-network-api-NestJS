import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateLinksPreviewDto,
  UpdateLinksPreviewDto,
} from './dto/links-preview.dto';
import { LinksPreviewEntity } from './entities/links-preview.entity';

@Injectable()
export class LinksPreviewService {
  constructor(
    @InjectRepository(LinksPreviewEntity)
    private readonly linksPreviewRepository: Repository<LinksPreviewEntity>,
  ) {}
  async create(createLinksPreviewDto: CreateLinksPreviewDto) {
    const newLink = await this.linksPreviewRepository.create(
      createLinksPreviewDto,
    );
    return this.linksPreviewRepository.save(newLink);
  }

  async findAll() {
    return await this.linksPreviewRepository.find();
  }

  async findById(id: string) {
    const checkLinkWithId = await this.linksPreviewRepository.findOne({
      where: { id },
    });
    if (!checkLinkWithId) throw new NotFoundException('Link does not found');
    return checkLinkWithId;
  }

  async update(id: string, updateLinksPreviewDto: UpdateLinksPreviewDto) {
    const checkLinkWithId = await this.findById(id);
    if (!checkLinkWithId) throw new BadRequestException('Link does not exist');
    await this.linksPreviewRepository.update(id, updateLinksPreviewDto);
    return;
  }

  async destroy(id: string) {
    const checkLinkWithId = await this.findById(id);
    if (!checkLinkWithId) throw new BadRequestException('Link does not exist');
    await this.linksPreviewRepository.delete(id);
    return;
  }
}
