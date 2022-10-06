import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { env, storageOfUploadFile } from 'src/configs/common.config';
import { CustomFileInterceptor } from 'src/interceptors/uploadFile.interceptor';
import { UsersService } from 'src/modules/users/services/users.service';
import { CurrentUser } from '../../auth/decorator/user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { CreateFileDto, UpdateFileDto } from '../../files/dto/file.dto';
import { IFile } from '../../files/interfaces/file.interface';
import { PostsService } from '../../posts/services/posts.service';
import { IUser } from '../../users/interfaces/user.interface';
import { CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto';
import { CommentsService } from '../services/comments.service';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @UseInterceptors(
    CustomFileInterceptor({
      typeUpload: 'multiple',
      fieldName: 'media',
      maxCount: 3,
      selectExt: 'all',
      localStoragePath: storageOfUploadFile.comment,
      limit: { fileSize: 3 }, // 3 MB
    }),
  )
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() currentUser: IUser,
    @UploadedFiles() files: any,
  ) {
    let user: IUser;
    if (currentUser && currentUser?.email) {
      user = await this.usersService.findByEmail(currentUser?.email);
    }
    delete user.password;

    let newFiles: IFile[] = [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        let newFile: CreateFileDto = {
          fileName: files[i].filename,
          fileUrl: `${env.APP_DOMAIN}/comments/media/${files[i].filename}`,
          size: files[i].size,
          type: files[i].mimetype,
        };
        newFiles.push(newFile);
      }
    }

    if (!user && !newFiles) throw new BadRequestException();
    if (newFiles.length <= 0) newFiles = [];

    const commentSaved = await this.commentsService.create(
      createCommentDto,
      newFiles,
      user,
    );
    delete commentSaved.creator.avatar;

    return commentSaved;
  }

  @Get()
  async findAllByPostId(
    @Query('postId') postId: string,
    @Query('level') level?: string,
  ) {
    if (!postId && !level) return await this.commentsService.findAll();
    return await this.commentsService.findAllByPostId(postId, +level);
  }

  @Get('detail/:uuid')
  async findOne(@Param('uuid') uuid: string, @Query('level') level: string) {
    if (level && +level > 0)
      return await this.commentsService.findByIdWithDepth(uuid, +level);
    return await this.commentsService.findById(uuid);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('edit/:uuid')
  @UseInterceptors(
    CustomFileInterceptor({
      typeUpload: 'multiple',
      fieldName: 'media',
      maxCount: 3,
      selectExt: 'all',
      localStoragePath: storageOfUploadFile.comment,
      limit: { fileSize: 3 }, // 3 MB
    }),
  )
  async edit(
    @Param('uuid') uuid: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() currentUser: IUser,
    @UploadedFiles() files: any,
  ) {
    let user: IUser;
    if (currentUser && currentUser?.email) {
      user = await this.usersService.findByEmail(currentUser?.email);
    }
    delete user.password;
    const checkCommentWithId = await this.commentsService.findById(uuid);
    console.log('checkPostWithId.author.id: ', checkCommentWithId.creatorId);
    console.log('user.id: ', user.id);

    if (checkCommentWithId.creatorId !== user.id)
      throw new ForbiddenException(
        'Not authorized because not the creator of this comment',
      );

    let newFiles: IFile[] = [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        let newFile: UpdateFileDto = {
          fileName: files[i].filename,
          fileUrl: `${env.APP_DOMAIN}/comments/media/${files[i].filename}`,
          size: files[i].size,
          type: files[i].mimetype,
        };
        console.log('>>> new file: ', newFile);
        newFiles.push(newFile);
      }
    }

    if (!user && !newFiles) throw new BadRequestException();

    console.log('new files length: ', newFiles.length);
    if (newFiles.length <= 0) newFiles = [];
    return await this.commentsService.update(
      uuid,
      updateCommentDto,
      user,
      newFiles,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('edit/link-preview/:uuid')
  async editLinkPreview(@Param('uuid') uuid: string) {
    return await this.commentsService.putLinkPreviewIntoComment(uuid);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('denounce/:uuid')
  async denounce(@Param('uuid') uuid: string) {
    return await this.commentsService.denounce(uuid);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('show/:uuid')
  async show(@Param('uuid') uuid: string) {
    return await this.commentsService.show(uuid);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('destroy/:uuid')
  async destroy(
    @Param('uuid') uuid: string,
    @CurrentUser() currentUser: IUser,
  ) {
    let user: IUser;
    if (currentUser && currentUser?.email) {
      user = await this.usersService.findByEmail(currentUser?.email);
    }
    const checkCommentWithId = await this.commentsService.findById(uuid);
    const checkPostWithId = await this.postsService.findById(
      checkCommentWithId.postId,
    );
    console.log(
      'checkCommentWithId.creator.id: ',
      checkCommentWithId.creatorId,
    );
    console.log('checkPostWithId.author.id: ', checkPostWithId.author.id);
    console.log('user.id: ', user.id);
    if (
      checkPostWithId.author.id !== user.id &&
      checkCommentWithId.creatorId !== user.id
    )
      throw new ForbiddenException(
        'Not authorized because not the author of this post',
      );
    return this.commentsService.destroy(uuid);
  }
}
