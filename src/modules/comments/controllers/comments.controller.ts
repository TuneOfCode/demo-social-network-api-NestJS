import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { join } from 'path';
import { of } from 'rxjs';
import { env, storageOfUploadFile } from 'src/configs/common.config';
import { CustomFileInterceptor } from 'src/interceptors/uploadFile.interceptor';
import { FilesService } from 'src/modules/files/services/files.service';
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
    private readonly filesService: FilesService,
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
    @Query('postId', new ParseUUIDPipe()) postId: string,
    @Query('level') level?: string,
  ) {
    if (!postId && !level) return await this.commentsService.findAll();
    return await this.commentsService.findAllByPostId(postId, +level);
  }

  @Get('detail/:commentId')
  async findOne(
    @Param('commentId', new ParseUUIDPipe()) commentId: string,
    @Query('level') level: string,
  ) {
    if (level && +level > 0)
      return await this.commentsService.findByIdWithDepth(commentId, +level);
    return await this.commentsService.findById(commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('media/:fileName')
  async getMediaFile(@Param('fileName') fileName: string, @Res() response) {
    try {
      const mediaFilePath = `${join(process.cwd())}/${env.APP_ROOT_STORAGE}${
        storageOfUploadFile.comment
      }/${fileName}`;
      const checkFileWithFileName = await this.filesService.findByFileName(
        fileName,
      );
      if (!checkFileWithFileName) {
        throw new NotFoundException('Media of post does not found');
      }
      return of(response.sendFile(mediaFilePath));
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('edit/:commentId')
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
    @Param('commentId', new ParseUUIDPipe()) commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() currentUser: IUser,
    @UploadedFiles() files: any,
  ) {
    let user: IUser;
    if (currentUser && currentUser?.email) {
      user = await this.usersService.findByEmail(currentUser?.email);
    }
    delete user.password;
    const checkCommentWithId = await this.commentsService.findById(commentId);
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
      commentId,
      updateCommentDto,
      user,
      newFiles,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('edit/link-preview/:commentId')
  async editLinkPreview(
    @Param('commentId', new ParseUUIDPipe()) commentId: string,
    @CurrentUser() currentUser: IUser,
  ) {
    const user = await this.usersService.findByEmail(currentUser?.email);
    const checkCommentWithId = await this.commentsService.findById(commentId);
    console.log('checkPostWithId.author.id: ', checkCommentWithId.creatorId);
    console.log('user.id: ', user.id);

    if (checkCommentWithId.creatorId !== user.id)
      throw new ForbiddenException(
        'Not authorized because not the creator of this comment',
      );
    return await this.commentsService.putLinkPreviewIntoComment(commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('denounce/:commentId')
  async denounce(@Param('commentId', new ParseUUIDPipe()) commentId: string) {
    return await this.commentsService.denounce(commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('show/:commentId')
  async show(@Param('commentId', new ParseUUIDPipe()) commentId: string) {
    return await this.commentsService.show(commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('destroy/:commentId')
  async destroy(
    @Param('commentId', new ParseUUIDPipe()) commentId: string,
    @CurrentUser() currentUser: IUser,
  ) {
    let user: IUser;
    if (currentUser && currentUser?.email) {
      user = await this.usersService.findByEmail(currentUser?.email);
    }
    const checkCommentWithId = await this.commentsService.findById(commentId);
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
    return this.commentsService.destroy(commentId);
  }
}
