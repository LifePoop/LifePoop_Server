import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { Friendship } from '@app/entity/friendship/friendship.entity';
import { Repository } from 'typeorm';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, Repository<Friendship>],
  exports: [UserRepository],
})
export class UserModule {}
