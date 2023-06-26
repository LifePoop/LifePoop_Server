import { Post } from '@app/entity/post/post.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(dataSource: DataSource) {
    super(Post, dataSource.createEntityManager());
  }
}
