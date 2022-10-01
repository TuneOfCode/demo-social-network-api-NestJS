import { Test, TestingModule } from '@nestjs/testing';
import { LinksPreviewController } from '../links-preview.controller';
import { LinksPreviewService } from '../links-preview.service';

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
