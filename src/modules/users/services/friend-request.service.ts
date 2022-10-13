import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IUser } from '../interfaces/user.interface';

import {
  CreateFriendRequestDto,
  UpdateFriendRequestDto,
} from '../dto/friendRequest.dto';

import { FriendRequestEntity } from '../entities/friend-request.entity';
import { EFriendRequestStatus } from '../interfaces/friendRequest.interface';
import { UsersService } from './users.service';
import { IAuthCookie } from 'src/modules/auth/interfaces/auth.interface';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequestEntity)
    private readonly friendRequestRepository: Repository<FriendRequestEntity>,
    private readonly usersService: UsersService,
  ) {}
  async sent(senderId: string, receiverId: string) {
    const checkUserWithSenderId = await this.usersService.findById(senderId);

    const checkUserWithReceiverId = await this.usersService.findById(
      receiverId,
    );

    if (senderId === receiverId)
      throw new BadRequestException('Sender and Receiver are not the same');
    const newFriendRequest = await this.friendRequestRepository.create({
      sender: { id: senderId },
      receiver: { id: receiverId },
    });

    console.log('senderId: ', checkUserWithSenderId.id);
    console.log('receiverId: ', checkUserWithReceiverId.id);

    const checkFriendRequestWithSenderIdAndReceiverId =
      await this.friendRequestRepository.findOne({
        where: [
          {
            sender: { id: senderId },
            receiver: { id: receiverId },
          },
          {
            sender: { id: receiverId },
            receiver: { id: senderId },
          },
        ],
      });
    console.log(
      'checkFriendRequestWithSenderIdAndReceiverId: ',
      checkFriendRequestWithSenderIdAndReceiverId,
    );
    if (checkFriendRequestWithSenderIdAndReceiverId)
      throw new BadRequestException('Sender sent this request to Receiver');
    return await this.friendRequestRepository.save(newFriendRequest);
  }

  async findAll() {
    return await this.friendRequestRepository.find({
      order: {
        createdAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  async findAllByStatus(status: EFriendRequestStatus) {
    return await this.friendRequestRepository.find({
      where: {
        status: In([status]),
      },
      order: {
        createdAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  async listFriendsOfUser(id: string) {
    let friends = await this.friendRequestRepository.find({
      where: [
        {
          sender: { id },
          status: EFriendRequestStatus.ACCEPTED,
        },
        { receiver: { id }, status: EFriendRequestStatus.ACCEPTED },
      ],
      relations: ['sender', 'receiver'],
      order: {
        createdAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
    friends.filter((item) => {
      delete item.sender.password;
      delete item.receiver.password;
      return item;
    });
    return friends;
  }

  async isFriend(userOneId: string, userTwoId: string) {
    const checkUserOneWithId = await this.usersService.findById(userOneId);
    const checkUserTwoWithId = await this.usersService.findById(userTwoId);
    if (userOneId === userTwoId) {
      const isFriend = await this.friendRequestRepository.findOne({
        where: [
          {
            sender: { id: checkUserOneWithId.id },
            status: EFriendRequestStatus.ACCEPTED,
          },
          {
            receiver: { id: checkUserTwoWithId.id },
            status: EFriendRequestStatus.ACCEPTED,
          },
        ],
      });
      if (isFriend) return true;
      return false;
    }
    const isFriend = await this.friendRequestRepository.findOne({
      where: [
        {
          sender: { id: checkUserOneWithId.id },
          receiver: { id: checkUserTwoWithId.id },
          status: EFriendRequestStatus.ACCEPTED,
        },
        {
          sender: { id: checkUserTwoWithId.id },
          receiver: { id: checkUserTwoWithId.id },
          status: EFriendRequestStatus.ACCEPTED,
        },
      ],
    });

    if (isFriend) return true;
    return false;
  }

  async findAFriendOfUser(senderId: string, id: string) {
    const checkUserWithId = await this.usersService.findById(id);
    const friend = await this.friendRequestRepository.findOne({
      where: [
        {
          sender: {
            id: senderId,
          },
          receiver: {
            id: checkUserWithId.id,
          },
          status: EFriendRequestStatus.ACCEPTED,
        },
        {
          sender: {
            id: checkUserWithId.id,
          },
          receiver: {
            id: senderId,
          },
          status: EFriendRequestStatus.ACCEPTED,
        },
      ],
      relations: ['sender', 'receiver'],
    });
    if (!friend) throw new NotFoundException('This user is not your friend');
    delete friend.sender.password;
    delete friend.receiver.password;
    return friend;
  }

  async update(
    id: string,
    updateFriendRequestDto: UpdateFriendRequestDto,
    currentUser: IAuthCookie,
  ) {
    const checkFriendRequestWithId = await this.friendRequestRepository.findOne(
      {
        where: { id },
      },
    );
    if (!checkFriendRequestWithId)
      throw new BadRequestException('Friend request does not exist');

    const checkUserWithId = await this.usersService.findById(currentUser.id);
    updateFriendRequestDto.sender = checkUserWithId;
    await this.friendRequestRepository.update(id, updateFriendRequestDto);
    return;
  }

  async accept(senderId: string, receiverId: string) {
    const checkUserWithReceiverId = await this.usersService.findById(
      receiverId,
    );

    if (senderId === receiverId)
      throw new BadRequestException('Sender and Receiver are not the same');

    const isCheckFriendRequestWithSenderIdAndReceiverId =
      await this.friendRequestRepository.findOne({
        where: [
          {
            sender: { id: senderId },
            receiver: { id: checkUserWithReceiverId.id },
            status: EFriendRequestStatus.PENDING,
          },
          {
            sender: { id: checkUserWithReceiverId.id },
            receiver: { id: senderId },
            status: EFriendRequestStatus.PENDING,
          },
        ],
      });
    if (!isCheckFriendRequestWithSenderIdAndReceiverId)
      throw new BadRequestException(
        "Haven't sent a friend request or are already friends",
      );

    const checkFriendRequestWithSenderIdAndReceiverId =
      await this.friendRequestRepository.findOne({
        where: [
          {
            sender: { id: senderId },
            receiver: { id: checkUserWithReceiverId.id },
            status: EFriendRequestStatus.PENDING,
          },
        ],
      });
    if (!checkFriendRequestWithSenderIdAndReceiverId)
      throw new BadRequestException('Receiver does not exist');
    await this.friendRequestRepository.update(
      checkFriendRequestWithSenderIdAndReceiverId.id,
      { status: EFriendRequestStatus.ACCEPTED },
    );
    return;
  }

  async cancel(senderId: string, receiverId: string) {
    const checkUserWithReceiverId = await this.usersService.findById(
      receiverId,
    );
    if (senderId === receiverId)
      throw new BadRequestException('Sender and Receiver are not the same');

    const isCheckFriendRequestWithSenderIdAndReceiverId =
      await this.friendRequestRepository.findOne({
        where: [
          {
            sender: { id: senderId },
            receiver: { id: checkUserWithReceiverId.id },
            status: EFriendRequestStatus.PENDING,
          },
          {
            sender: { id: checkUserWithReceiverId.id },
            receiver: { id: senderId },
            status: EFriendRequestStatus.PENDING,
          },
        ],
      });
    if (!isCheckFriendRequestWithSenderIdAndReceiverId)
      throw new BadRequestException(
        "Haven't sent a friend request or are already friends",
      );
    const checkFriendRequestWithSenderIdAndReceiverId =
      await this.friendRequestRepository.findOne({
        where: [
          {
            sender: { id: senderId },
            receiver: { id: checkUserWithReceiverId.id },
            status: EFriendRequestStatus.PENDING,
          },
        ],
      });
    if (!checkFriendRequestWithSenderIdAndReceiverId)
      throw new BadRequestException('Receiver does not exist');

    await this.destroy(checkFriendRequestWithSenderIdAndReceiverId.id);
    return;
  }

  async destroy(id: string) {
    const checkFriendRequestWithId = await this.friendRequestRepository.findOne(
      {
        where: [{ id }],
      },
    );
    if (!checkFriendRequestWithId)
      throw new BadRequestException('Friend request does not exist');

    await this.friendRequestRepository.delete(id);
  }
}
