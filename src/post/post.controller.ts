import { Body, Controller, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { CreatePostRequestDto } from './dto/request/creat-post-reuqest.dto';

@ApiTags('post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Auth()
  @Post()
  @ApiOperation({ summary: '변기록 생성' })
  @ApiCreatedResponse({ description: '업로드 된 변기록', type: Post })
  async create(
    @Body() { writerId, isGood, color, shape, date }: CreatePostRequestDto,
  ) {
    return await this.postService.create(writerId, isGood, color, shape, date);
  }
}
