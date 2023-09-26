import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { FriendshipRepository } from './friendship.repository';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, FriendshipRepository],
  exports: [UserRepository, FriendshipRepository],
})
export class UserModule {}
