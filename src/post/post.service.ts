import { Injectable } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { Post } from '@app/entity/post/post.entity';
import { StoryService } from 'src/story/stroy.service';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly storyService: StoryService,
  ) {}

  /**
   * 게시글 작성 후, 해당 게시글에 대한 스토리를 생성합니다.
   * @param writerId
   * @param isGood
   * @param color
   * @param size
   * @param shape
   * @param date
   * @returns 생성된 게시글
   */
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

    await this.storyService.createPostStory(color, size, shape, writerId, date);

    return await this.postRepository.findOne({
      where: { id },
    });
  }

  async findByUser(userId: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { writerId: userId },
    });
  }

  async findByUserAndDate(userId: number, date: Date): Promise<Post[]> {
    console.log(date.toISOString().slice(0, 10));
    return await this.postRepository.findByUserAndDate(userId, date);
  }

  async update(
    isGood: boolean,
    color: number,
    size: number,
    shape: number,
    postId: number,
  ): Promise<Post> {
    return await this.postRepository.save({
      isGood,
      color,
      size,
      shape,
      id: postId,
    });
  }

  async delete(postId: number): Promise<void> {
    await this.postRepository.delete({
      id: postId,
    });
  }
}
