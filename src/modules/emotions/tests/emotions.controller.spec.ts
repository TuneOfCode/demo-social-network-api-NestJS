import { Test, TestingModule } from '@nestjs/testing';
import { EmotionsController } from '../controllers/emotions.controller';
import { EmotionsService } from '../services/emotions.service';

describe('EmotionsController', () => {
  let controller: EmotionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmotionsController],
      providers: [EmotionsService],
    }).compile();

    controller = module.get<EmotionsController>(EmotionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
