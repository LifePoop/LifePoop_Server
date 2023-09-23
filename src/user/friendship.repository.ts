import { Friendship } from '@app/entity/friendship/friendship.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class FriendshipRepository extends Repository<Friendship> {
  constructor(dataSource: DataSource) {
    super(Friendship, dataSource.createEntityManager());
  }
}
