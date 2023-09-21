import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Put,
} from '@nestjs/common';
import { PostService } from './post.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { CreatePostRequestDto } from './dto/request/create-post-reuqest.dto';
import { PostResponseDto } from './dto/response/post-response.dto';
import { UpdatePostRequestDto } from './dto/request/update-post-request.dto';
import { UserRequest } from 'src/common/decorators/user-request.decorator';
import { UserPayload } from 'src/auth/types/jwt-payload.interface';

@ApiTags('post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Auth('access')
  @Post()
  @ApiOperation({ summary: '변기록 생성' })
  @ApiCreatedResponse({
    description: '업로드 된 변기록',
    type: PostResponseDto,
  })
  async create(
    @Body()
    { isGood, color, size, shape, date }: CreatePostRequestDto,
    @UserRequest() { userId: writerId }: UserPayload,
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

  @Auth('access')
  @Delete(':postId')
  @ApiOperation({ summary: '변기록 삭제' })
  @ApiOkResponse({ description: '변기록 삭제 성공 여부' })
  async delete(@Param('postId') postId: number): Promise<void> {
    return await this.postService.delete(postId);
  }

  @Auth('access')
  @Put(':postId')
  @ApiOperation({ summary: '변기록 수정' })
  @ApiOkResponse({ description: '변기록 수정 성공 여부' })
  async update(
    @Body() { isGood, color, size, shape }: UpdatePostRequestDto,
    @Param('postId') postId: number,
  ): Promise<PostResponseDto> {
    return await this.postService.update(isGood, color, size, shape, postId);
  }

  @Auth('access')
  @Get(':userId')
  @ApiOperation({ summary: '특정 유저의 변기록 조회' })
  @ApiOkResponse({ description: '특정 유저의 변기록', type: [PostResponseDto] })
  async getByUser(@Param('userId') userId: number): Promise<PostResponseDto[]> {
    return await this.postService.findByUser(userId);
  }

  @Auth('access')
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
