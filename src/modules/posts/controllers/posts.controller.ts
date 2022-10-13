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
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { join } from 'path';
import { of } from 'rxjs';
import { env, storageOfUploadFile } from 'src/configs/common.config';
import { decoded } from 'src/helpers/common.helper';
import { CustomFileInterceptor } from 'src/interceptors/uploadFile.interceptor';
import { CurrentUser } from '../../auth/decorator/user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { IAuthCookie } from '../../auth/interfaces/auth.interface';
import { CreateFileDto, UpdateFileDto } from '../../files/dto/file.dto';
import { IFile } from '../../files/interfaces/file.interface';
import { FilesService } from '../../files/services/files.service';
import { IUser } from '../../users/interfaces/user.interface';

import { UsersService } from 'src/modules/users/services/users.service';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto';
import { PostsService } from '../services/posts.service';

@Controller('posts')
export class PostsController {
  constructor(
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
      maxCount: 10,
      selectExt: 'all',
      localStoragePath: storageOfUploadFile.post,
      limit: { fileSize: 10 }, // 10 MB
    }),
  )
  async create(
    @Body() createPostDto: CreatePostDto,
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
          fileUrl: `${env.APP_DOMAIN}/posts/media/${files[i].filename}`,
          size: files[i].size,
          type: files[i].mimetype,
        };
        newFiles.push(newFile);
      }
    }
    if (!user && !newFiles) throw new BadRequestException();
    const newPostCreated = await this.postsService.create(
      createPostDto,
      user,
      newFiles,
    );
    delete newPostCreated.author;
    delete newPostCreated.link;
    delete newPostCreated.mediaFiles;
    return newPostCreated;
  }

  @Get()
  async findAll(@Query('page') page: string, @Query('limit') limit: string) {
    if (!page && !limit) return await this.postsService.findAll();
    return await this.postsService.paginate({
      page: page ? +page : 1,
      limit: limit ? +limit : 2,
    });
  }

  @Get('public-to-everyone')
  async findAllByModePublicEveryone(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    if (!page && !limit)
      return await this.postsService.findAllByModePublicEveryone();
    return await this.postsService.paginate({
      page: page ? +page : 1,
      limit: limit ? +limit : 2,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('public-to-friends/:authorId')
  async findAllByModePublic(
    @Req() request: Request,
    @Param('authorId', new ParseUUIDPipe()) authorId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    if (!page && !limit)
      return await this.postsService.findAllByModePublicFriendsOfUser(
        currentUser.id,
        authorId,
      );
    return await this.postsService.paginate({
      page: page ? +page : 1,
      limit: limit ? +limit : 2,
    });
  }

  @Get('detail/:postId')
  async findById(@Param('postId', new ParseUUIDPipe()) postId: string) {
    return await this.postsService.findById(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('media/:fileName')
  async getMediaFile(@Param('fileName') fileName: string, @Res() response) {
    try {
      const mediaFilePath = `${join(process.cwd())}/${env.APP_ROOT_STORAGE}${
        storageOfUploadFile.post
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
  @Patch('edit/:postId')
  @UseInterceptors(
    CustomFileInterceptor({
      typeUpload: 'multiple',
      fieldName: 'media',
      maxCount: 10,
      selectExt: 'all',
      localStoragePath: storageOfUploadFile.post,
      limit: { fileSize: 10 }, // 10 MB
    }),
  )
  async edit(
    @Param('postId', new ParseUUIDPipe()) postId: string,
    @Req() request: Request,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() files: any,
  ) {
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    const user: IUser = await this.usersService.findById(currentUser.id);
    const checkPostWithId = await this.postsService.findById(postId);
    console.log('checkPostWithId.author.id: ', checkPostWithId.author.id);
    console.log('user.id: ', currentUser.id);
    if (checkPostWithId.author.id !== currentUser.id)
      throw new ForbiddenException(
        'Not authorized because not the author of this post',
      );

    let newFiles: IFile[] = [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        let newFile: UpdateFileDto = {
          fileName: files[i].filename,
          fileUrl: `${env.APP_DOMAIN}/posts/media/${files[i].filename}`,
          size: files[i].size,
          type: files[i].mimetype,
        };
        console.log('>>> new file: ', newFile);
        newFiles.push(newFile);
      }
    }

    if (!user && !newFiles) throw new BadRequestException();
    delete user.password;
    console.log('new files length: ', newFiles.length);
    if (newFiles.length <= 0) newFiles = [];
    return await this.postsService.update(
      postId,
      updatePostDto,
      user,
      newFiles,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('edit/link-preview/:postId')
  async editLinkPreview(
    @Param('postId', new ParseUUIDPipe()) postId: string,
    @Req() request: Request,
  ) {
    const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    const checkPostWithId = await this.postsService.findById(postId);
    console.log('checkPostWithId.author.id: ', checkPostWithId.author.id);
    console.log('user.id: ', currentUser.id);
    if (checkPostWithId.author.id !== currentUser.id)
      throw new ForbiddenException(
        'Not authorized because not the author of this post',
      );
    return await this.postsService.putLinkPreviewIntoPost(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('destroy/:postId')
  async destroy(
    @Param('postId', new ParseUUIDPipe()) postId: string,
    @CurrentUser() currentUser: IUser,
  ) {
    let user: IUser;
    if (currentUser && currentUser?.email) {
      user = await this.usersService.findByEmail(currentUser?.email);
    }
    const checkPostWithId = await this.postsService.findById(postId);
    console.log('checkPostWithId.author.id: ', checkPostWithId.author.id);
    console.log('user.id: ', user.id);
    if (checkPostWithId.author.id !== user.id)
      throw new ForbiddenException(
        'Not authorized because not the author of this post',
      );
    return await this.postsService.destroy(postId);
  }
}
