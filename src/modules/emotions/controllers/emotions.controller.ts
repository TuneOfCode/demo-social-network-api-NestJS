import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { CreateEmotionDto, UpdateEmotionDto } from '../dto/emotion.dto';
import { ESymbolEmotions } from '../interfaces/emotion.interface';
import { EmotionsService } from '../services/emotions.service';

@Controller('emotions')
export class EmotionsController {
  constructor(private readonly emotionsService: EmotionsService) {}
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() createEmotionDto: CreateEmotionDto) {
    return await this.emotionsService.create(createEmotionDto);
  }

  @Get()
  async findAll() {
    return await this.emotionsService.findAll();
  }

  @Get('analysis-creator/:creatorId')
  async findAllByCreator(
    @Param('creatorId', new ParseUUIDPipe()) creatorId: string,
    @Query('symbol') symbol?: ESymbolEmotions,
  ) {
    return await this.emotionsService.findAndCountAllByCreatorId(
      creatorId,
      symbol,
    );
  }

  @Get('analysis-post/:postId')
  async findAllByPost(
    @Param('postId', new ParseUUIDPipe()) postId: string,
    @Query('symbol') symbol?: ESymbolEmotions,
  ) {
    return await this.emotionsService.findAndCountAllByPostId(postId, symbol);
  }

  @Get('analysis-comment/:commentId')
  async findAllByComment(
    @Param('commentId', new ParseUUIDPipe()) commentId: string,
    @Query('symbol') symbol?: ESymbolEmotions,
  ) {
    return await this.emotionsService.findAndCountAllByCommentId(
      commentId,
      symbol,
    );
  }

  @Get('analysis-symbol')
  async findAllBySymbol(@Query('symbol') symbol: ESymbolEmotions) {
    if (!symbol) return await this.emotionsService.findAll();
    return await this.emotionsService.findAndCountAllBySymbolEmotion(symbol);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('edit/:emotionId')
  async change(
    @Param('emotionId', new ParseUUIDPipe()) emotionId: string,
    @Body() updateEmotionDto: UpdateEmotionDto,
  ) {
    return await this.emotionsService.changeSymbolEmotion(
      emotionId,
      updateEmotionDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('destroy/:emotionId')
  async destroy(@Param('emotionId', new ParseUUIDPipe()) emotionId: string) {
    return await this.emotionsService.destroy(emotionId);
  }
}
