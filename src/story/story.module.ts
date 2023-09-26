import { Module } from '@nestjs/common';
import { StoryController } from './story.controller';
import { StoryService } from './stroy.service';
import { StoryRepository } from './stroy.repository';
import { UserModule } from 'src/user/user.module';
import { UserStoryViewRepository } from './user-story-view.repository';

@Module({
  imports: [UserModule],
  controllers: [StoryController],
  providers: [StoryService, StoryRepository, UserStoryViewRepository],
  exports: [StoryService],
})
export class StoryModule {}
