import { Controller, Get } from '@nestjs/common';
import { StoryService } from './stroy.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { UserRequest } from 'src/common/decorators/user-request.decorator';
import { UserPayload } from 'src/auth/types/jwt-payload.interface';
import { GetFriendsStoriesResponseBodyElementDto } from './dto/get-friends-stories.dto';

@ApiTags('story')
@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  // 내 친구들의 24시간 스토리 목록 조회
  @Auth('access')
  @Get()
  @ApiOperation({
    summary: '내 친구들의 24시간 스토리 목록 조회',
    description: '내가 아직 읽지 않은 스토리를 우선 정렬로 반환',
  })
  @ApiOkResponse({
    type: [GetFriendsStoriesResponseBodyElementDto],
  })
  getFriendsStories(
    @UserRequest() { userId }: UserPayload,
  ): Promise<GetFriendsStoriesResponseBodyElementDto[]> {
    return this.storyService.getFriendsStories(userId);
  }

  // 특정 친구의 스토리 확인 상태로 전환
}
