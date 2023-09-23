import { Story } from '@app/entity/story/stroy.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class StoryRepository extends Repository<Story> {
  constructor(dataSource: DataSource) {
    super(Story, dataSource.createEntityManager());
  }
}
