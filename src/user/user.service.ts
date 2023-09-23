import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from '../../libs/entity/user/user.entity';
import { Friendship } from '@app/entity/friendship/friendship.entity';
import { FriendshipRepository } from './friendship.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly friendshipRepository: FriendshipRepository,
  ) {}

  findById(userId: number): Promise<User> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  update(
    nickname: string,
    characterColor: number,
    characterShape: number,
    userId: number,
  ): Promise<User> {
    return this.userRepository.save({
      id: userId,
      nickname,
      characterColor,
      characterShape,
    });
  }

  findFriendship(userId: number): Promise<User[]> {
    return this.userRepository.findFriendship(userId);
  }

  async addFriendship(inviteCode: string, userId: number): Promise<Friendship> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const toUser = await this.userRepository.findOne({ where: { inviteCode } });
    return await this.friendshipRepository.save({
      from_user: user,
      to_user: toUser,
      date: new Date(),
    });
  }
}
