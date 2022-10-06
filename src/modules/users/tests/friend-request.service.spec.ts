import { Test, TestingModule } from '@nestjs/testing';
import { FriendRequestService } from '../services/friend-request.service';

describe('FriendRequestService', () => {
  let service: FriendRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FriendRequestService],
    }).compile();

    service = module.get<FriendRequestService>(FriendRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
