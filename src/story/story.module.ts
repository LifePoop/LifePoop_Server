import { Module } from '@nestjs/common';
import { StoryController } from './story.controller';
import { StoryService } from './stroy.service';
import { StoryRepository } from './stroy.repository';

@Module({
  controllers: [StoryController],
  providers: [StoryService, StoryRepository],
  exports: [StoryService],
})
export class StoryModule {}
