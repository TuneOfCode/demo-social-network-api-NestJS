import { Test, TestingModule } from '@nestjs/testing';
import { LinksPreviewService } from '../links-preview.service';

describe('LinksPreviewService', () => {
  let service: LinksPreviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LinksPreviewService],
    }).compile();

    service = module.get<LinksPreviewService>(LinksPreviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
