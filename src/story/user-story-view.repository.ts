import { UserStoryView } from '@app/entity/user-story-view/user-story-view.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserStoryViewRepository extends Repository<UserStoryView> {
  constructor(dataSource: DataSource) {
    super(UserStoryView, dataSource.createEntityManager());
  }
}
