import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IComment } from 'src/modules/comments/interfaces/comment.interface';
import { CommentsService } from 'src/modules/comments/services/comments.service';
import { IPost } from 'src/modules/posts/interfaces/post.interface';
import { PostsService } from 'src/modules/posts/services/posts.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { Repository } from 'typeorm';
import { CreateEmotionDto, UpdateEmotionDto } from '../dto/emotion.dto';
import { EmotionEntity } from '../entities/emotion.entity';
import { ESymbolEmotions } from '../interfaces/emotion.interface';

@Injectable()
export class EmotionsService {
  constructor(
    @InjectRepository(EmotionEntity)
    private readonly emotionsRepository: Repository<EmotionEntity>,
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}
  async create(createEmotionDto: CreateEmotionDto) {
    const checkUserWithId = await this.usersService.findById(
      createEmotionDto.creatorId,
    );
    let checkPostWithId: IPost;
    let checkCommentWithId: IComment;
    if (createEmotionDto.postId && createEmotionDto.commentId)
      throw new BadRequestException(
        'Only allow reactions to posts or comments',
      );

    if (createEmotionDto.postId) {
      checkPostWithId = await this.postsService.findById(
        createEmotionDto.postId,
      );
    }

    if (createEmotionDto.commentId) {
      checkCommentWithId = await this.commentsService.findById(
        createEmotionDto.commentId,
      );
    }
    console.log('checkPostWithId?.id: ', checkPostWithId?.id);
    console.log('checkCommentWithId?.id: ', checkCommentWithId?.id);
    const checkEmotionWithPostAndComment =
      await this.emotionsRepository.findOne({
        where: [
          {
            creator: { id: checkUserWithId.id },
            post: { id: checkPostWithId?.id },
            comment: { id: checkCommentWithId?.id },
          },
        ],
      });
    console.log(
      'checkEmotionWithPostAndComment: ',
      checkEmotionWithPostAndComment,
    );
    if (checkEmotionWithPostAndComment)
      throw new BadRequestException('Post and comment had emotion');

    const newEmotion = await this.emotionsRepository.create({
      symbol: createEmotionDto.symbol,
      creator: { id: checkUserWithId.id },
      post: { id: checkPostWithId?.id },
      comment: { id: checkCommentWithId?.id },
    });
    return await this.emotionsRepository.save(newEmotion);
  }

  async findAll() {
    return await this.emotionsRepository.find({
      order: {
        createdAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  async findAndCountAllByCreatorId(
    creatorId: string,
    symbol?: ESymbolEmotions,
  ) {
    const checkUserWithId = await this.usersService.findById(creatorId);
    const creatorReacted = await this.emotionsRepository.findAndCount({
      where: [
        {
          creator: { id: checkUserWithId.id },
          symbol,
        },
      ],
      order: {
        createdAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
    return {
      data: creatorReacted[0],
      count: creatorReacted[1],
    };
  }

  async findAndCountAllByPostId(postId: string, symbol?: ESymbolEmotions) {
    const checkPostWithId = await this.postsService.findById(postId);
    const postReacted = await this.emotionsRepository.findAndCount({
      where: [
        {
          post: { id: checkPostWithId.id },
          symbol,
        },
      ],
      order: {
        createdAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
    return {
      data: postReacted[0],
      count: postReacted[1],
    };
  }

  async findAndCountAllByCommentId(
    commentId: string,
    symbol?: ESymbolEmotions,
  ) {
    const checkCommentWithId = await this.commentsService.findById(commentId);
    const commentsReacted = await this.emotionsRepository.findAndCount({
      where: [
        {
          comment: { id: checkCommentWithId.id },
          symbol,
        },
      ],
      order: {
        createdAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
    return {
      data: commentsReacted[0],
      count: commentsReacted[1],
    };
  }

  async findAndCountAllBySymbolEmotion(symbol: ESymbolEmotions) {
    return await this.emotionsRepository.findAndCount({
      where: [{ symbol: symbol }],
    });
  }

  async findByEmotionId(emotionId: string) {
    const checkEmotionWithId = await this.emotionsRepository.findOne({
      where: [{ id: emotionId }],
    });
    if (!checkEmotionWithId)
      throw new NotFoundException('Emotion does not exist');
    return checkEmotionWithId;
  }

  async changeSymbolEmotion(
    emotionId: string,
    updateEmotionDto: UpdateEmotionDto,
  ) {
    const checkEmotionWithId = await this.findByEmotionId(emotionId);

    if (updateEmotionDto.postId && updateEmotionDto.commentId)
      throw new BadRequestException(
        'Only allow reactions to posts or comments',
      );

    await this.emotionsRepository.update(checkEmotionWithId.id, {
      symbol: updateEmotionDto.symbol,
    });
    return;
  }

  async destroy(emotionId: string) {
    const checkEmotionWithId = await this.findByEmotionId(emotionId);
    await this.emotionsRepository.delete(checkEmotionWithId.id);
    return;
  }
}
