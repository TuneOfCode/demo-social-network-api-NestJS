import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository, UpdateResult } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
    const users = await this.userRepository.find();
    users.map((user) => delete user.password);
    return users;
  }

  async findById(id: string): Promise<UserEntity> {
    const checkUserWithId = await this.userRepository.findOne({
      where: { id },
    });
    if (!checkUserWithId)
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    delete checkUserWithId.password;
    return checkUserWithId;
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const checkUserWithEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (!checkUserWithEmail)
      throw new HttpException('Email does not exist', HttpStatus.BAD_REQUEST);
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
    return await this.userRepository.update(id, updateUserDto);
  }

  async destroy(id: string) {
    const checkUserWithId = await this.findById(id);
    if (!checkUserWithId)
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    return await this.userRepository.delete(id);
  }
}
