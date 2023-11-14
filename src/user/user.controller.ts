import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorator/auth.decorator';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserResponseDto } from './dto/response/user-response.dto';
import { UpdateUserRequestDto } from './dto/request/update-user-request.dto';
import { UserRequest } from 'src/common/decorators/user-request.decorator';
import { UserPayload } from 'src/auth/types/jwt-payload.interface';
import { plainToInstance } from 'class-transformer';
import { CheerRequestParamDto } from './dto/cheer.dto';
import {
  GetCheersRequestParamDto,
  GetCheersResponseBodyDto,
} from './dto/get-cheers.dto';
import { User } from '@app/entity/user/user.entity';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth('access')
  @Get('friendship')
  @ApiOperation({ summary: '나의 친구 조회' })
  @ApiOkResponse({
    description: '나의 친구',
    type: [UserResponseDto],
  })
  async getFriendship(
    @UserRequest() { userId }: UserPayload,
  ): Promise<UserResponseDto[]> {
    const friendship = await this.userService.findFriendship(userId);

    return plainToInstance(UserResponseDto, friendship);
  }

  @Auth('access')
  @Get(':userId')
  @ApiOperation({ summary: '특정 유저 조회' })
  @ApiOkResponse({
    description: '특정 유저',
    type: UserResponseDto,
  })
  async get(@Param('userId') userId: number): Promise<UserResponseDto> {
    const user = await this.userService.findById(userId);

    return plainToInstance(UserResponseDto, user);
  }

  @Auth('access')
  @Get()
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiOkResponse({
    description: '내 정보',
    type: User,
  })
  getMe(@UserRequest() { userId }: UserPayload): Promise<User> {
    return this.userService.findById(userId);
  }

  @Auth('access')
  @Put()
  @ApiOperation({ summary: '내 정보 수정' })
  @ApiOkResponse({
    description: '변경된 유저 정보',
    type: UserResponseDto,
  })
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
  @ApiCreatedResponse({ description: '친구 추가 성공' })
  async addFriendship(
    @Param('inviteCode') inviteCode: string,
    @UserRequest() { userId }: UserPayload,
  ): Promise<void> {
    await this.userService.addFriendship(inviteCode, userId);
  }

  @Auth('access')
  @HttpCode(204)
  @Delete('friendship/:friendId')
  @ApiOperation({ summary: '친구 삭제' })
  @ApiNoContentResponse({ description: '친구 삭제 성공' })
  async deleteFriendship(
    @Param('friendId') friendId: number,
    @UserRequest() { userId }: UserPayload,
  ): Promise<void> {
    await this.userService.deleteFriendship(userId, friendId);
  }

  @Auth('access')
  @Post('cheer/:toUserId')
  @ApiOperation({ summary: '응원하기' })
  @ApiCreatedResponse()
  async cheer(
    @Param() { toUserId }: CheerRequestParamDto,
    @UserRequest() { userId: fromUserId }: UserPayload,
  ): Promise<void> {
    await this.userService.cheer(toUserId, fromUserId);
  }

  @Auth('access')
  @Get(':userId/cheer/:date')
  @ApiOperation({ summary: '특정 유저의 특정 일자 응원 조회 ' })
  @ApiOkResponse({ type: GetCheersResponseBodyDto })
  getCheers(
    @Param() { userId, date }: GetCheersRequestParamDto,
  ): Promise<GetCheersResponseBodyDto> {
    return this.userService.getCheers(date, userId);
  }
}
