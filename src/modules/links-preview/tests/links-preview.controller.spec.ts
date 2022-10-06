import { Test, TestingModule } from '@nestjs/testing';
import { LinksPreviewController } from '../controllers/links-preview.controller';
import { LinksPreviewService } from '../services/links-preview.service';

describe('LinksPreviewController', () => {
  let controller: LinksPreviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinksPreviewController],
      providers: [LinksPreviewService],
    }).compile();

    controller = module.get<LinksPreviewController>(LinksPreviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
