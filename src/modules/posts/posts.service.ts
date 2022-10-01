import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { join } from 'path';
import { env, storageOfUploadFile } from 'src/configs/common.config';
import { getLinkPreview } from 'src/helpers/common.helper';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { FilesService } from '../files/files.service';
import { IFile } from '../files/interfaces/file.interface';
import { ILinkPreview } from '../links-preview/interfaces/links-preview.interface';
import { LinksPreviewService } from '../links-preview/links-preview.service';
import { Pagination } from '../paginations/index.pagination';
import { IPaginationOptions } from '../paginations/interfaces/options.interface';
import { IUser } from '../users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { PostEntity } from './entities/post.entity';
import { EMode } from './interfaces/post.interface';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepository: Repository<PostEntity>,
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
    private readonly linksPreviewService: LinksPreviewService,
  ) {}
  async paginate(
    options: IPaginationOptions<PostEntity>,
  ): Promise<Pagination<PostEntity>> {
    if (options.page < 1)
      throw new BadRequestException(`Number of pages cannot be less than 1`);
    const index = (options.page - 1) * options.limit;
    const [data] = await this.postsRepository.findAndCount({
      skip: index,
      take: options.limit,
      order: {
        createdAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
    const user = await this.findAll();
    const paginates = new Pagination<PostEntity>({
      data: data,
      paginate: {
        records: data.length,
        page: options.page < 1 ? 1 : options.page,
        limit: options.limit,
        pages: user.length / options.limit,
        previous: index - options.limit < 0 ? 0 : index - options.limit,
        next:
          index + options.limit > user.length
            ? user.length - options.limit
            : index + options.limit,
      },
    });
    return paginates;
  }

  async create(
    createPostDto: CreatePostDto,
    user: IUser,
    files: IFile[],
  ): Promise<PostEntity> {
    if (user) {
      const checkUserWithId = this.usersService.findById(user.id);
      if (!checkUserWithId)
        throw new BadRequestException('User does not exist');
      createPostDto.author = user;
    }
    if (files) {
      createPostDto.mediaFiles = files;
      for (let i = 0; i < files.length; i++) {
        await this.filesService.create(files[i]);
      }
    }
    // // Tách ra ra 1 api riêng để post nhanh hơn
    // if (createPostDto.text) {
    //   const linkPreview = await getLinkPreview(createPostDto.text);
    //   if (linkPreview.url && Object.keys(linkPreview.data).length > 0) {
    //     const newLink: ILinkPreview = {
    //       url: linkPreview.url,
    //       title: linkPreview.data.title,
    //       description: linkPreview.data.description,
    //       thumbnail: linkPreview.data.img,
    //       linkIframe: linkPreview.data.linkIframe,
    //     };
    //     const newLinkCreated = await this.linksPreviewService.create(newLink);
    //     createPostDto.link = {
    //       ...newLink,
    //       id: newLinkCreated.id,
    //     };
    //   }
    // }
    const newPost = await this.postsRepository.create(createPostDto);
    return await this.postsRepository.save(newPost);
  }

  async putLinkPreviewIntoPost(id: string) {
    const checkPostWithId = await this.findById(id);
    if (checkPostWithId.text && !checkPostWithId.link) {
      const linkPreview = await getLinkPreview(checkPostWithId.text);
      if (linkPreview.url && Object.keys(linkPreview.data).length > 0) {
        const newLink: ILinkPreview = {
          url: linkPreview.url,
          title: linkPreview.data.title,
          description: linkPreview.data.description,
          thumbnail: linkPreview.data.img,
          linkIframe: linkPreview.data.linkIframe,
        };
        const newLinkCreated = await this.linksPreviewService.create(newLink);
        await this.postsRepository.update(id, {
          link: {
            ...newLink,
            id: newLinkCreated.id,
          },
        });
      }
      return;
    }

    if (checkPostWithId.text) {
      let newLink: ILinkPreview;
      let linkInPostDto: ILinkPreview;
      const linkPreview = await getLinkPreview(checkPostWithId.text);
      if (linkPreview.url && Object.keys(linkPreview.data).length > 0) {
        newLink = {
          url: linkPreview.url,
          title: linkPreview.data.title,
          description: linkPreview.data.description,
          thumbnail: linkPreview.data.img,
          linkIframe: linkPreview.data.linkIframe,
        };
      }
      if (checkPostWithId.link !== null) {
        await this.linksPreviewService.update(checkPostWithId.link.id, newLink);
        linkInPostDto = {
          ...newLink,
          id: checkPostWithId.link.id,
        };
      } else {
        const newLinkCreated = await this.linksPreviewService.create(newLink);
        linkInPostDto = {
          ...newLink,
          id: newLinkCreated.id,
        };
      }
      await this.postsRepository.update(id, { link: linkInPostDto });
    }
    return;
  }

  async findAll(): Promise<PostEntity[]> {
    return await this.postsRepository.find({
      order: {
        createdAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }
  async findAllByModePublicEveryone(): Promise<PostEntity[]> {
    return await this.postsRepository.find({
      where: { mode: EMode.PUBLIC_EVERYONE },
      order: {
        createdAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  async findAllByModePublicFriends(): Promise<PostEntity[]> {
    return await this.postsRepository.find({
      where: { mode: EMode.PUBLIC_FRIENDS },
      order: {
        createdAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  async findById(id: string): Promise<PostEntity> {
    const checkPostWithId = await this.postsRepository.findOne({
      where: { id },
      relations: ['author', 'link', 'mediaFiles'],
    });
    if (!checkPostWithId)
      throw new HttpException('Post does not found', HttpStatus.NOT_FOUND);
    delete checkPostWithId.authorId;
    delete checkPostWithId.linkId;
    delete checkPostWithId.author.password;
    delete checkPostWithId.files;
    return checkPostWithId;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    user: IUser,
    files: IFile[],
  ): Promise<UpdateResult> {
    const checkPostWithId = await this.findById(id);
    if (!checkPostWithId)
      throw new HttpException('Post does not exist', HttpStatus.BAD_REQUEST);

    if (updatePostDto.author && user) {
      const checkUserWithId = await this.usersService.findById(user.id);

      if (!checkUserWithId)
        throw new BadRequestException('User does not exist');
      updatePostDto.author = user;
    }

    if (Object.keys(files).length > 0) {
      for (let i = 0; i < files.length; i++) {
        await this.filesService.create(files[i]);
      }
      await this.postsRepository
        .createQueryBuilder()
        .relation(PostEntity, 'mediaFiles')
        .of(id)
        .addAndRemove(files, checkPostWithId.mediaFiles);
      const oldFilesInPost = checkPostWithId.mediaFiles;
      for (let i = 0; i < Object.keys(oldFilesInPost).length; i++) {
        // delete old mediaFiles (when deploy will keep)
        console.log(
          'checkPostWithId.mediaFiles?.fileName: ',
          oldFilesInPost[i].fileName,
        );
        const mediaFiles = `${join(process.cwd())}/${env.APP_ROOT_STORAGE}${
          storageOfUploadFile.post
        }/${oldFilesInPost[i].fileName}`;
        fs.unlink(mediaFiles, (error) => {
          console.log('error: ', error);
          return error;
        });
        await this.filesService.destroy(oldFilesInPost[i].fileName);
      }
    }

    // // thay thế để update nhanh hơn, cập nhật link preview qua api khác
    // if (updatePostDto.text) {
    //   const linkPreview = await getLinkPreview(updatePostDto.text);
    //   if (linkPreview.url && Object.keys(linkPreview.data).length > 0) {
    //     let newLink: ILinkPreview = {
    //       url: linkPreview.url || null,
    //       title: linkPreview.data.title || null,
    //       description: linkPreview.data.description || null,
    //       thumbnail: linkPreview.data.img || null,
    //       linkIframe: linkPreview.data.linkIframe || null,
    //     };

    //     if (checkPostWithId.link !== null) {
    //       await this.linksPreviewService.update(
    //         checkPostWithId.link.id,
    //         newLink,
    //       );
    //       updatePostDto.link = {
    //         ...newLink,
    //         id: checkPostWithId.link.id,
    //       };
    //     } else {
    //       const newLinkCreated = await this.linksPreviewService.create(newLink);
    //       updatePostDto.link = {
    //         ...newLink,
    //         id: newLinkCreated.id,
    //       };
    //     }
    //   } else {
    //     updatePostDto.link = null;
    //   }
    // }

    await this.postsRepository.update(id, updatePostDto);

    return;
  }

  async destroy(id: string): Promise<DeleteResult> {
    const checkPostWithId = await this.findById(id);
    if (!checkPostWithId)
      throw new HttpException('Post does not exist', HttpStatus.BAD_REQUEST);
    await this.postsRepository.delete(id);
    if (checkPostWithId.link) {
      await this.linksPreviewService.destroy(checkPostWithId.link.id);
    }
    return;
  }
}
