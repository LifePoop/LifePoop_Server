import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dto/response/user-response.dto';
import { UpdateUserRequestDto } from './dto/request/update-user-request.dto';
import { UserRequest } from 'src/common/decorators/user-request.decorator';
import { UserPayload } from 'src/auth/types/jwt-payload.interface';
import { plainToInstance } from 'class-transformer';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth('access')
  @Get('friendship')
  @ApiOperation({ summary: '나의 친구 조회' })
  @ApiOkResponse({ description: '나의 친구', type: [UserResponseDto] })
  async getFriendship(
    @UserRequest() { userId }: UserPayload,
  ): Promise<UserResponseDto[]> {
    const friendship = await this.userService.findFriendship(userId);

    return plainToInstance(UserResponseDto, friendship);
  }

  @Auth('access')
  @Get(':userId')
  @ApiOperation({ summary: '특정 유저 조회' })
  @ApiOkResponse({ description: '특정 유저', type: UserResponseDto })
  async get(@Param('userId') userId: number): Promise<UserResponseDto> {
    const user = await this.userService.findById(userId);

    return plainToInstance(UserResponseDto, user);
  }

  @Auth('access')
  @Put()
  @ApiOperation({ summary: '내 정보 수정' })
  @ApiOkResponse({ description: '변경된 유저 정보', type: UserResponseDto })
  async update(
    @Body() { nickname, characterColor, characterShape }: UpdateUserRequestDto,
    @UserRequest() { userId }: UserPayload,
  ): Promise<UserResponseDto> {
    const user = await this.userService.update(
      nickname,
      characterColor,
      characterShape,
      userId,
    );

    return plainToInstance(UserResponseDto, user);
  }

  @Auth('access')
  @Post('friendship/:inviteCode')
  @ApiOperation({ summary: '친구 추가' })
  @ApiOkResponse({ description: '친구 추가 성공' })
  async addFriendship(
    @Param('inviteCode') inviteCode: string,
    @UserRequest() { userId }: UserPayload,
  ): Promise<void> {
    await this.userService.addFriendship(inviteCode, userId);
  }
}
