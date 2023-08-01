import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PostService } from './post.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { CreatePostRequestDto } from './dto/request/create-post-reuqest.dto';
import { Post as PostEntity } from '@app/entity/post/post.entity';
import { PostResponseDto } from './dto/response/post-response.dto';

@ApiTags('post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Auth()
  @Post()
  @ApiOperation({ summary: '변기록 생성' })
  @ApiCreatedResponse({
    description: '업로드 된 변기록',
    type: PostResponseDto,
  })
  async create(
    @Body()
    { writerId, isGood, color, size, shape, date }: CreatePostRequestDto,
  ): Promise<PostResponseDto> {
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
  @ApiOkResponse({ description: '특정 유저의 변기록', type: [PostResponseDto] })
  async getByUser(@Param('userId') userId: number): Promise<PostResponseDto[]> {
    return await this.postService.findByUser(userId);
  }

  @Auth()
  @Get('/:userId/:date')
  @ApiOperation({ summary: '특정 유저의 특정 일자 변기록 조회' })
  @ApiOkResponse({
    description: '특정 유저의 특정 일자 변기록',
    type: PostResponseDto,
  })
  async getByUserAndDate(
    @Param('userId') userId: number,
    @Param('date') date: Date,
  ): Promise<PostResponseDto> {
    return await this.postService.findByUserAndDate(userId, date);
  }
}
