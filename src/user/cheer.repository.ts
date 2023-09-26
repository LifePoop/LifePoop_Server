import { Cheer } from '@app/entity/cheer/cheer.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CheerRepository extends Repository<Cheer> {
  constructor(dataSource: DataSource) {
    super(Cheer, dataSource.createEntityManager());
  }
}
