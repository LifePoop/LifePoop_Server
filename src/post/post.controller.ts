import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { CreatePostRequestDto } from './dto/request/creat-post-reuqest.dto';
import { Post as PostEntity } from '@app/entity/post/post.entity';

@ApiTags('post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Auth()
  @Post()
  @ApiOperation({ summary: '변기록 생성' })
  @ApiCreatedResponse({ description: '업로드 된 변기록', type: PostEntity })
  async create(
    @Body()
    { writerId, isGood, color, size, shape, date }: CreatePostRequestDto,
  ): Promise<PostEntity> {
    return await this.postService.create(
      writerId,
      isGood,
      color,
      size,
      shape,
      date,
    );
  }

  @Auth()
  @Get(':userId')
  @ApiOperation({ summary: '특정 유저의 변기록 조회' })
  @ApiCreatedResponse({ description: '특정 유저의 변기록' })
  async get(@Param('userId') userId: number): Promise<PostEntity[]> {
    return await this.postService.findByUser(userId);
  }

  @Auth()
  @Get('/:userId/:date')
  @ApiOperation({ summary: '나의 오늘의 변기록 조회' })
  @ApiCreatedResponse({ description: '나의 오늘의 변기록' })
  async getToday(@Param('userId') userId: number, @Param('date') date: Date) {
    return await this.postService.findByUserAndDate(userId, date);
  }
}
