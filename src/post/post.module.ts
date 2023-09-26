import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';
import { StoryModule } from 'src/story/story.module';

@Module({
  imports: [StoryModule],
  controllers: [PostController],
  providers: [PostService, PostRepository],
})
export class PostModule {}
