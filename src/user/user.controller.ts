import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@app/entity/user/user.entity';
import { UserResponseDto } from './dto/response/user-response.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth()
  @Get(':userId')
  @ApiOperation({ summary: '특정 유저 조회' })
  @ApiOkResponse({ description: '특정 유저', type: UserResponseDto })
  async get(@Param('userId') userId: number): Promise<UserResponseDto> {
    return await this.userService.findById(userId);
  }
}
