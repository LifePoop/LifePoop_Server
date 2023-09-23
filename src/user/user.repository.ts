import { User } from '@app/entity/user/user.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findFriendship(userId: number): Promise<User[]> {
    const rawResult = await this.query(
      `
      SELECT 
        CASE
          WHEN f.from_user_id = ? THEN f.to_user_id
          WHEN f.to_user_id = ? THEN f.from_user_id
        END AS friend_id
      FROM friendship f
      WHERE f.from_user_id = ? OR f.to_user_id = ?;
      `,
      [userId, userId, userId, userId],
    );

    const friendIds = rawResult.map((row) => row.friend_id);

    return this.findBy({ id: In(friendIds) });
  }
}
