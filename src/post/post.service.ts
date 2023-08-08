import { Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { Post } from '@app/entity/post/post.entity';
import { Raw } from 'typeorm';

@Injectable()
export class PostService {
  update(
    isGood: boolean,
    color: number,
    size: number,
    shape: number,
    userId: number,
    date: Date,
  ): void | PromiseLike<void> {
    throw new Error('Method not implemented.');
  }
  delete(userId: number, date: any): void | PromiseLike<void> {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly postRepository: PostRepository) {}

  async create(
    writerId: number,
    isGood: boolean,
    color: number,
    size: number,
    shape: number,
    date: Date,
  ): Promise<Post> {
    const { id } = await this.postRepository.save({
      isGood,
      color,
      size,
      shape,
      date,
      writerId,
    });

    return await this.postRepository.findOne({
      where: { id },
    });
  }

  async findByUser(userId: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { writerId: userId },
    });
  }

  async findByUserAndDate(userId: number, date: Date): Promise<Post> {
    console.log(date.toISOString().slice(0, 10));
    return await this.postRepository.findByUserAndDate(userId, date);
  }
}
