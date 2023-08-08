import { User } from '@app/entity/user/user.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  findFriendship(userId: number): Promise<User[]> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.fromFriendship', 'fromFriendship')
      .leftJoinAndSelect('user.toFriendship', 'toFriendship')
      .where('fromFriendship.from_user_id = :userId', { userId })
      .orWhere('toFriendship.to_user_id = :userId', { userId })
      .getMany();
  }
}
