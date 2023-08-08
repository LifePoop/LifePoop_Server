import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from '../../libs/entity/user/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
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
}
