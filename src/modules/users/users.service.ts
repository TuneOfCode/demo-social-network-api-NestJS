import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { IAuthCookie } from '../auth/interfaces/auth.interface';
import { FilesService } from '../files/files.service';
import { EMode } from '../posts/interfaces/post.interface';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';

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
    if (createUserDto.avatar) {
      await this.filesService.create(createUserDto.avatar);
    }
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

  async findById(id: string): Promise<UserEntity> {
    const checkUserWithId = await this.userRepository.findOne({
      where: { id, isDisabled: false },
      relations: ['avatar', 'posts'],
    });
    if (!checkUserWithId)
      throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    checkUserWithId.posts = checkUserWithId.posts.filter(
      (item) => item.mode !== EMode.PRIVATE,
    );
    delete checkUserWithId.password;
    delete checkUserWithId.postId;
    delete checkUserWithId.avatarImg;
    return checkUserWithId;
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const checkUserWithEmail = await this.userRepository.findOne({
      where: { email },
      relations: ['avatar', 'posts'],
    });
    // if (!checkUserWithEmail)
    //   throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    if (checkUserWithEmail) {
      delete checkUserWithEmail.postId;
      delete checkUserWithEmail.avatarImg;
    }
    return checkUserWithEmail;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    const checkUserWithId = await this.findById(id);
    if (!checkUserWithId)
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);

    if (updateUserDto.email) {
      const checkUserWithEmail = await this.findByEmail(updateUserDto.email);
      if (checkUserWithEmail)
        throw new HttpException(
          `Email '${updateUserDto.email}' already exist`,
          HttpStatus.CONFLICT,
        );
    }
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto.password = hashedPassword;
    }

    if (updateUserDto.avatar) {
      await this.filesService.create(updateUserDto.avatar);
    }
    await this.userRepository.update(id, updateUserDto);
    if (updateUserDto.avatar)
      if (checkUserWithId.avatar) {
        await this.destroyRelationWithFile(checkUserWithId.avatar.fileName);
      }
    return;
  }

  async disable(id: string): Promise<UpdateResult> {
    const checkUserWithId = await this.userRepository.findOne({
      where: { id },
    });
    if (!checkUserWithId)
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    await this.userRepository.update(id, { isDisabled: true });
    return;
  }

  async restore(id: string): Promise<UpdateResult> {
    const checkUser = await this.userRepository.findOne({
      where: { id },
    });
    if (!checkUser)
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    await this.userRepository.update(id, { isDisabled: false });
    return;
  }

  async destroyRelationWithFile(fileName: string): Promise<DeleteResult> {
    await this.filesService.destroy(fileName);
    return;
  }

  async destroy(id: string, currentUser: IAuthCookie): Promise<DeleteResult> {
    const checkUserWithId = await this.findById(id);
    if (!checkUserWithId)
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    if (currentUser.id !== id)
      throw new HttpException(
        'Do not have permission to access this resource',
        HttpStatus.FORBIDDEN,
      );
    await this.userRepository.delete(id);
    if (checkUserWithId.avatar) {
      const fileName = checkUserWithId.avatar.fileName;
      await this.filesService.destroy(fileName);
    }
    return;
  }
}
