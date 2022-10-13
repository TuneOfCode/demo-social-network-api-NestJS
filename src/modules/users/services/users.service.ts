import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { IAuthCookie } from 'src/modules/auth/interfaces/auth.interface';
import { FilesService } from 'src/modules/files/services/files.service';
import { EMode } from 'src/modules/posts/interfaces/post.interface';
import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly filesService: FilesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const checkUserWithEmail = await this.findByEmail(createUserDto.email);
    if (checkUserWithEmail)
      throw new HttpException(
        `Email '${createUserDto.email}' already exist`,
        HttpStatus.CONFLICT,
      );
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.userRepository.find({
      where: { isDisabled: false },
      order: {
        fullname: 'ASC',
      },
    });
    users.map((user) => delete user.password);
    return users;
  }

  async findById(userId: string): Promise<UserEntity> {
    const checkUserWithId = await this.userRepository.findOne({
      where: [
        {
          id: userId,
          isDisabled: false,
          // posts: { mode: In([EMode.PUBLIC_EVERYONE, EMode.PUBLIC_FRIENDS]) },
        },
      ],
      relations: [
        'avatar',
        'posts',
        'comments',
        'sentFriendRequests',
        'receivedFriendRequests',
        'emotions',
      ],
    });
    if (!checkUserWithId)
      throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    checkUserWithId.posts = checkUserWithId.posts.filter(
      (item) => item.mode !== EMode.PRIVATE,
    );
    delete checkUserWithId?.password;
    delete checkUserWithId?.avatarImg;
    delete checkUserWithId?.postIds;
    delete checkUserWithId?.commentIds;
    delete checkUserWithId?.senderIds;
    delete checkUserWithId?.receiverIds;
    delete checkUserWithId?.emotionIds;

    return checkUserWithId;
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const checkUserWithEmail = await this.userRepository.findOne({
      where: [{ email }],
      relations: [
        'avatar',
        'posts',
        'comments',
        'sentFriendRequests',
        'receivedFriendRequests',
        'emotions',
      ],
    });
    return checkUserWithEmail;
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    const checkUserWithId = await this.findById(userId);
    if (!checkUserWithId)
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);

    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto.password = hashedPassword;
    }

    if (updateUserDto.avatar) {
      await this.filesService.create(updateUserDto.avatar);
    }
    await this.userRepository.update(userId, updateUserDto);
    if (updateUserDto.avatar)
      if (checkUserWithId.avatar) {
        await this.destroyRelationWithFile(checkUserWithId.avatar.fileName);
      }
    return;
  }

  async disable(userId: string): Promise<UpdateResult> {
    const checkUserWithId = await this.userRepository.findOne({
      where: [{ id: userId }],
    });
    if (!checkUserWithId)
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    await this.userRepository.update(userId, { isDisabled: true });
    return;
  }

  async restore(userId: string): Promise<UpdateResult> {
    const checkUser = await this.userRepository.findOne({
      where: [{ id: userId }],
    });
    if (!checkUser)
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    await this.userRepository.update(userId, { isDisabled: false });
    return;
  }

  async destroyRelationWithFile(fileName: string): Promise<DeleteResult> {
    await this.filesService.destroy(fileName);
    return;
  }

  async destroy(
    userId: string,
    currentUser: IAuthCookie,
  ): Promise<DeleteResult> {
    const checkUserWithId = await this.findById(userId);
    if (!checkUserWithId)
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    if (currentUser.id !== userId)
      throw new HttpException(
        'Do not have permission to access this resource',
        HttpStatus.FORBIDDEN,
      );
    await this.userRepository.delete(userId);
    if (checkUserWithId.avatar) {
      const fileName = checkUserWithId.avatar.fileName;
      await this.filesService.destroy(fileName);
    }
    return;
  }
}
