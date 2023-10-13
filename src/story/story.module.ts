import { Module, forwardRef } from '@nestjs/common';
import { StoryController } from './story.controller';
import { StoryService } from './stroy.service';
import { StoryRepository } from './stroy.repository';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [UserModule, forwardRef(() => PostModule)],
  controllers: [StoryController],
  providers: [StoryService, StoryRepository],
  exports: [StoryService, StoryRepository],
})
export class StoryModule {}
