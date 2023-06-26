import { Post } from '@app/entity/post/post.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(dataSource: DataSource) {
    super(Post, dataSource.createEntityManager());
  }

  findByUserAndDate(userId: number, date: Date): Post[] | PromiseLike<Post[]> {
    return this.createQueryBuilder('post')
      .where('post.writerId = :userId', { userId })
      .andWhere('DATE(post.date) = DATE(:date)', { date })
      .getMany();
  }
}
