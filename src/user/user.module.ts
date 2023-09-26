import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { FriendshipRepository } from './friendship.repository';
import { CheerRepository } from './cheer.repository';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    FriendshipRepository,
    CheerRepository,
  ],
  exports: [UserRepository, FriendshipRepository, CheerRepository],
})
export class UserModule {}
