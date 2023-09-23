import { Injectable } from '@nestjs/common';
import { StoryRepository } from './stroy.repository';
import { Story } from '@app/entity/story/stroy.entity';

@Injectable()
export class StoryService {
  constructor(private readonly storyRepository: StoryRepository) {}

  async createPostStory(
    color: number,
    size: number,
    shape: number,
    writerId: number,
    date: Date,
  ): Promise<Story> {
    const { id } = await this.storyRepository.save({
      color,
      size,
      shape,
      writerId,
      date,
    });

    return await this.storyRepository.findOne({
      where: { id },
    });
  }
}
