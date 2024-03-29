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

  @Auth('access')
  @Get()
  @ApiOperation({
    summary: '24시간 안에 스토리를 올린 친구 목록과 스토리 목록 조회',
    description: '스토리 생성순으로 정렬, 모든 데이터를 한 번에 반환',
  })
  @ApiOkResponse({ type: [GetFriendsStoriesResponseBodyElementDto] })
  getFriendsStories(@UserRequest() { userId }: UserPayload) {
    return this.storyService.getFriendsStories(userId);
  }

  // @Auth('access')
  // @Get()
  // @ApiOperation({
  //   summary: '내 친구들의 24시간 스토리 목록 조회',
  //   description: '내가 아직 읽지 않은 스토리를 우선 정렬로 반환',
  // })
  // @ApiOkResponse({ type: [GetFriendsStoriesResponseBodyElementDto] })
  // getFriendsStories(
  //   @UserRequest() { userId }: UserPayload,
  // ): Promise<GetFriendsStoriesResponseBodyElementDto[]> {
  //   return this.storyService.getFriendsStories(userId);
  // }

  // @Auth('access')
  // @Get(':storyId')
  // @ApiOperation({ summary: '스토리 상세 조회 & 읽음 처리' })
  // @ApiOkResponse({ type: GetStoryResponseBodyDto })
  // @ApiNotFoundResponse({ description: '존재하지 않는 스토리' })
  // getStory(
  //   @UserRequest() { userId }: UserPayload,
  //   @Param() { storyId }: GetStoryRequestParamDto,
  // ): Promise<GetStoryResponseBodyDto> {
  //   return this.storyService.getStoryAndMarkAsViewed(storyId, userId);
  // }
}
