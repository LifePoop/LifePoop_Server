import { Friendship } from '@app/entity/friendship/friendship.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class FriendshipRepository extends Repository<Friendship> {
  constructor(dataSource: DataSource) {
    super(Friendship, dataSource.createEntityManager());
  }

  async findFriendshipIds(userId: number): Promise<number[]> {
    const rawResult: [{ friend_id: number }] = await this.query(
      `
        SELECT 
          CASE
            WHEN from_user_id = ? THEN to_user_id
            WHEN to_user_id = ? THEN from_user_id
          END AS friend_id
        FROM friendship
        WHERE from_user_id = ? OR to_user_id = ?;
      `,
      [userId, userId, userId, userId],
    );

    return rawResult.map((row) => row.friend_id);
  }
}
