import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from '../../libs/entity/user/user.entity';
import { Friendship } from '@app/entity/friendship/friendship.entity';
import { FriendshipRepository } from './friendship.repository';
import { Between, In, MoreThan } from 'typeorm';
import { CheerRepository } from './cheer.repository';
import { Cheer } from '@app/entity/cheer/cheer.entity';
import { convertDayEnd, convertDayStart } from 'libs/utils/convert-day';
import { GetCheersResponseBodyDto } from './dto/get-cheers.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly friendshipRepository: FriendshipRepository,
    private readonly cheerRepository: CheerRepository,
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

  async findFriendship(userId: number): Promise<User[]> {
    const friendshipIds = await this.friendshipRepository.findFriendshipIds(
      userId,
    );

    return this.userRepository.findBy({ id: In(friendshipIds) });
  }

  async addFriendship(inviteCode: string, userId: number): Promise<Friendship> {
    const toUser = await this.userRepository.findOne({ where: { inviteCode } });
    if (toUser === null) {
      throw new NotFoundException('초대코드가 유효하지 않습니다.');
    }
    if (userId === toUser.id) {
      throw new BadRequestException('자기 자신을 추가할 수 없습니다.');
    }

    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        { from_user: { id: userId }, to_user: { id: toUser.id } },
        { from_user: { id: toUser.id }, to_user: { id: userId } }, // 중복 관계 검사 추가
      ],
    });
    if (existingFriendship !== null) {
      throw new ConflictException('이미 친구입니다.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    return await this.friendshipRepository.save({
      from_user: user,
      to_user: toUser,
      date: new Date(),
    });
  }

  async deleteFriendship(userId: number, friendId: number): Promise<void> {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { from_user: { id: userId }, to_user: { id: friendId } },
        { from_user: { id: friendId }, to_user: { id: userId } },
      ],
    });
    if (friendship === null) {
      throw new NotFoundException('친구 관계가 아닙니다.');
    }

    await this.friendshipRepository.delete(friendship.id);
  }

  async cheer(toUserId: number, fromUserId: number): Promise<void | Cheer> {
    const toUser = await this.userRepository.findOne({
      where: { id: toUserId },
    });
    const fromUser = await this.userRepository.findOne({
      where: { id: fromUserId },
    });

    const todayCheer = await this.cheerRepository.findOne({
      where: {
        fromUser,
        toUser,
        date: MoreThan(convertDayStart(new Date())),
      },
    });

    if (todayCheer === null) {
      return await this.cheerRepository.save({
        fromUser,
        toUser,
        date: new Date(),
      });
    }
  }

  async getCheers(
    date: Date,
    userId: number,
  ): Promise<GetCheersResponseBodyDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const cheers = await this.cheerRepository.find({
      where: {
        toUser: user,
        date: Between(convertDayStart(date), convertDayEnd(date)),
      },
      order: { date: 'DESC' },
      relations: ['fromUser'],
    });

    const thumbs = cheers.slice(0, 2).map(({ fromUser }) => ({
      id: fromUser.id,
      nickname: fromUser.nickname,
      characterColor: fromUser.characterColor,
      characterShape: fromUser.characterShape,
    }));

    return {
      count: cheers.length,
      thumbs,
    };
  }
}
