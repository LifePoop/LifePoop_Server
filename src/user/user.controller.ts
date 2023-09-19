import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dto/response/user-response.dto';
import { UpdateUserRequestDto } from './dto/request/update-user-request.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth('access')
  @Get(':userId')
  @ApiOperation({ summary: '특정 유저 조회' })
  @ApiOkResponse({ description: '특정 유저', type: UserResponseDto })
  async get(@Param('userId') userId: number): Promise<UserResponseDto> {
    return await this.userService.findById(userId);
  }

  @Auth('access')
  @Put(':userId')
  @ApiOperation({ summary: '특정 유저 수정' })
  @ApiOkResponse({ description: '변경된 유저 정보', type: UserResponseDto })
  async update(
    @Body() { nickname, characterColor, characterShape }: UpdateUserRequestDto,
    @Param('userId') userId: number,
  ): Promise<UserResponseDto> {
    return await this.userService.update(
      nickname,
      characterColor,
      characterShape,
      userId,
    );
  }

  @Auth('access')
  @Get('friendship/:userId')
  @ApiOperation({ summary: '특정 유저의 친구 조회' })
  @ApiOkResponse({ description: '특정 유저의 친구', type: [UserResponseDto] })
  async getFriendship(
    @Param('userId') userId: number,
  ): Promise<UserResponseDto[]> {
    return await this.userService.findFriendship(userId);
  }
}
