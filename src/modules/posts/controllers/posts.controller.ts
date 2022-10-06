import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
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
import { FilesService } from '../../files/services/files.service';
import { IFile } from '../../files/interfaces/file.interface';
import { IUser } from '../../users/interfaces/user.interface';

import { CreatePostDto, UpdatePostDto } from '../dto/post.dto';
import { PostsService } from '../services/posts.service';
import { UsersService } from 'src/modules/users/services/users.service';

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
  @Get('public-to-friends')
  async findAllByModePublicFriends(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    if (!page && !limit)
      return await this.postsService.findAllByModePublicFriends();
    return await this.postsService.paginate({
      page: page ? +page : 1,
      limit: limit ? +limit : 2,
    });
  }

  @Get('detail/:uuid')
  async findById(@Req() request: Request, @Param('uuid') uuid: string) {
    // const currentUser: IAuthCookie = decoded(request.cookies[env.JWT_COOKIE]);
    // if (currentUser && currentUser.id) {
    //   return await this.postsService.findById(uuid);
    // }
    return await this.postsService.findById(uuid);
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
  @Patch('edit/:uuid')
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
    @Param('uuid') uuid: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() currentUser: IUser,
    @UploadedFiles() files: any,
  ) {
    let user: IUser;
    if (currentUser && currentUser?.email) {
      user = await this.usersService.findByEmail(currentUser?.email);
    }
    const checkPostWithId = await this.postsService.findById(uuid);
    console.log('checkPostWithId.author.id: ', checkPostWithId.author.id);
    console.log('user.id: ', user.id);
    if (checkPostWithId.author.id !== user.id)
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
    return await this.postsService.update(uuid, updatePostDto, user, newFiles);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('edit/link-preview/:uuid')
  async editLinkPreview(@Param('uuid') uuid: string) {
    return await this.postsService.putLinkPreviewIntoPost(uuid);
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
    const checkPostWithId = await this.postsService.findById(uuid);
    console.log('checkPostWithId.author.id: ', checkPostWithId.author.id);
    console.log('user.id: ', user.id);
    if (checkPostWithId.author.id !== user.id)
      throw new ForbiddenException(
        'Not authorized because not the author of this post',
      );
    return await this.postsService.destroy(uuid);
  }
}
