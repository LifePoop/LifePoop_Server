import { Controller } from '@nestjs/common';
import { StoryService } from './stroy.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('story')
@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  // 내 친구들의 24시간 스토리 목록 조회

  // 특정 친구의 스토리 확인 상태로 전환
}
