import { Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { Post } from '@app/entity/post/post.entity';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async create(
    writerId: number,
    isGood: boolean,
    color: number,
    shape: number,
    date: Date,
  ): Promise<Post> {
    const { id } = await this.postRepository.save({
      isGood,
      color,
      shape,
      date,
      writerId,
    });

    return await this.postRepository.findOne({
      where: { id },
    });
  }
}
