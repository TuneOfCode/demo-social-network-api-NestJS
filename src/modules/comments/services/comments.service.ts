import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { join } from 'path';
import { env, storageOfUploadFile } from 'src/configs/common.config';
import { getLinkPreview } from 'src/helpers/common.helper';
import { UsersService } from 'src/modules/users/services/users.service';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { IFile } from '../../files/interfaces/file.interface';
import { FilesService } from '../../files/services/files.service';
import { ILinkPreview } from '../../links-preview/interfaces/links-preview.interface';
import { LinksPreviewService } from '../../links-preview/services/links-preview.service';
import { PostsService } from '../../posts/services/posts.service';
import { IUser } from '../../users/interfaces/user.interface';
import { CreateCommentDto, UpdateCommentDto } from '../dto/comment.dto';
import { CommentEntity } from '../entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentsRepository: Repository<CommentEntity>,
    private readonly filesService: FilesService,
    private readonly linksPreviewService: LinksPreviewService,
    private readonly usersService: UsersService,
    private readonly postService: PostsService,
  ) {}
  async create(
    createCommentDto: CreateCommentDto,
    files: IFile[],
    user: IUser,
  ) {
    const checkUserWithId = await this.usersService.findById(user.id);
    if (!checkUserWithId) throw new BadRequestException('User does not exist');
    createCommentDto.creator = checkUserWithId;

    if (!createCommentDto.postId)
      throw new BadRequestException('Comments must have post');
    const checkPostWithId = await this.postService.findById(
      createCommentDto.postId,
    );
    if (!checkPostWithId) throw new BadRequestException('Post does not exist');
    createCommentDto.post = checkPostWithId;

    if (!checkPostWithId.isComment)
      throw new ForbiddenException('This post does not allow comments');
    if (files && files.length > 0) {
      createCommentDto.mediaFiles = files;
      for (let i = 0; i < files.length; i++) {
        await this.filesService.create(files[i]);
      }
    }

    if (!createCommentDto.parentCommentId) {
      const newComment = await this.commentsRepository.create(createCommentDto);
      return await this.commentsRepository.save(newComment);
    }

    const parent = await this.commentsRepository.findOne({
      where: [
        {
          id: createCommentDto.parentCommentId,
          post: { id: createCommentDto.postId },
        },
      ],
    });
    console.log('parent: ', parent);
    if (!parent) throw new BadRequestException('Parent comment does not exist');
    const newCommentReply = await this.commentsRepository.create(
      createCommentDto,
    );
    newCommentReply.parentComment = parent;
    return await this.commentsRepository.save(newCommentReply);
  }

  async putLinkPreviewIntoComment(commentId: string) {
    const checkCommentWithId = await this.findById(commentId);
    if (checkCommentWithId.text && !checkCommentWithId.link) {
      const linkPreview = await getLinkPreview(checkCommentWithId.text);
      if (linkPreview.url && Object.keys(linkPreview.data).length > 0) {
        const newLink: ILinkPreview = {
          url: linkPreview.url,
          title: linkPreview.data.title,
          description: linkPreview.data.description,
          thumbnail: linkPreview.data.img,
          linkIframe: linkPreview.data.linkIframe,
        };
        const newLinkCreated = await this.linksPreviewService.create(newLink);
        await this.commentsRepository.update(commentId, {
          link: {
            ...newLink,
            id: newLinkCreated.id,
          },
        });
      }
      return;
    }

    if (checkCommentWithId.text) {
      let newLink: ILinkPreview;
      let linkInCommentDto: ILinkPreview;
      const linkPreview = await getLinkPreview(checkCommentWithId.text);
      if (linkPreview.url && Object.keys(linkPreview.data).length > 0) {
        newLink = {
          url: linkPreview.url,
          title: linkPreview.data.title,
          description: linkPreview.data.description,
          thumbnail: linkPreview.data.img,
          linkIframe: linkPreview.data.linkIframe,
        };
      }
      if (checkCommentWithId.link !== null) {
        await this.linksPreviewService.update(
          checkCommentWithId.link.id,
          newLink,
        );
        linkInCommentDto = {
          ...newLink,
          id: checkCommentWithId.link.id,
        };
      } else {
        const newLinkCreated = await this.linksPreviewService.create(newLink);
        linkInCommentDto = {
          ...newLink,
          id: newLinkCreated.id,
        };
      }
      await this.commentsRepository.update(commentId, {
        link: linkInCommentDto,
      });
    }
    return;
  }

  async findAll() {
    return this.commentsRepository.find();
  }

  async findAllByPostId(postId: string, level?: number) {
    const allComments = await this.commentsRepository.manager
      .getTreeRepository(CommentEntity)
      .findTrees({ depth: level - 1 });
    const checkPostWithId = await this.postService.findById(postId);

    const checkCommentWithPostId = allComments.filter(
      (item) => item.postId === checkPostWithId.id,
    );

    return checkCommentWithPostId;
  }

  async findById(commentId: string) {
    const checkCommentWithId = await this.commentsRepository.manager
      .getTreeRepository(CommentEntity)
      .findOne({ where: [{ id: commentId, isShow: true }] });

    if (!checkCommentWithId)
      throw new NotFoundException('Comment does not found');

    return checkCommentWithId;
  }

  async findByIdWithDepth(commentId: string, level?: number) {
    const checkCommentWithId = await this.findById(commentId);
    const checkChildCommentWithParent = await this.commentsRepository.manager
      .getTreeRepository(CommentEntity)
      .findDescendantsTree(checkCommentWithId, { depth: level - 1 });

    // console.log('checkCommentWithId: ', checkCommentWithId);
    if (checkCommentWithId && !checkCommentWithId.isShow)
      throw new NotFoundException('This comment was hidden');
    if (!checkCommentWithId && !checkChildCommentWithParent)
      throw new NotFoundException('Comment does not found');
    return checkChildCommentWithParent;
  }

  async update(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    user: IUser,
    files: IFile[],
  ): Promise<UpdateResult> {
    const checkCommentWithId = await this.findById(commentId);
    if (!checkCommentWithId)
      throw new BadRequestException('Post does not exist');

    if (updateCommentDto.creator && user) {
      const checkUserWithId = await this.usersService.findById(user.id);

      if (!checkUserWithId)
        throw new BadRequestException('User does not exist');
      updateCommentDto.creator = user;
    }

    if (Object.keys(files).length > 0 && checkCommentWithId.mediaFiles) {
      for (let i = 0; i < files.length; i++) {
        await this.filesService.create(files[i]);
      }
      await this.commentsRepository
        .createQueryBuilder()
        .relation(CommentEntity, 'mediaFiles')
        .of(commentId)
        .addAndRemove(files, checkCommentWithId.mediaFiles);
      const oldFilesInPost = checkCommentWithId.mediaFiles;
      for (let i = 0; i < Object.keys(oldFilesInPost).length; i++) {
        // delete old mediaFiles (when deploy will keep)
        console.log(
          'checkCommentWithId.mediaFiles?.fileName: ',
          oldFilesInPost[i].fileName,
        );
        const mediaFiles = `${join(process.cwd())}/${env.APP_ROOT_STORAGE}${
          storageOfUploadFile.comment
        }/${oldFilesInPost[i].fileName}`;
        fs.unlink(mediaFiles, (error) => {
          console.log('error: ', error);
          return error;
        });
        await this.filesService.destroy(oldFilesInPost[i].fileName);
      }
    }

    await this.commentsRepository.update(commentId, updateCommentDto);

    return;
  }

  async hide(commentId: string) {
    const checkCommentWithId = await this.findById(commentId);
    await this.commentsRepository.update(checkCommentWithId.id, {
      isShow: false,
    });
    return;
  }

  async show(commentId: string) {
    const checkCommentWithId = await this.findById(commentId);
    await this.commentsRepository.update(checkCommentWithId.id, {
      isShow: true,
      denounce: 0,
    });
    return;
  }

  async denounce(commentId: string) {
    const checkCommentWithId = await this.findById(commentId);
    await this.commentsRepository.update(checkCommentWithId.id, {
      denounce: checkCommentWithId.denounce + 1,
    });
    checkCommentWithId.denounce += 1;
    console.log('checkCommentWithId.denounce: ', checkCommentWithId.denounce);
    // N???u c?? t??? 3 tr??? l??n th?? ???n b??nh lu???n n??y
    if (checkCommentWithId.denounce > 2) await this.hide(commentId);
    return;
  }

  async destroy(commentId: string): Promise<DeleteResult> {
    const checkCommentWithId = await this.findById(commentId);
    if (!checkCommentWithId)
      throw new BadRequestException('Comment does not exist');
    await this.commentsRepository.delete(commentId);
    if (checkCommentWithId.link) {
      await this.linksPreviewService.destroy(checkCommentWithId.link.id);
    }
    return;
  }
}
