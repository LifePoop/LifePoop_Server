import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UserRequest } from '../common/decorators/user-request.decorator';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { AccessToken } from './types/token-response.interface';
import { KakaoAuthGuard } from './utils/guards/kakao-auth.guard';
import { UserPayload } from './types/jwt-payload.interface';
import { Auth } from './decorator/auth.decorator';
import { WithdrawRequestDto } from './dto/withdraw-request.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('*/login')
  @ApiOperation({ description: 'OAuth 로그인' })
  @ApiBody({
    description: 'OAuth 액세스 토큰(AccessToken) 및 제공자(vendor)',
    type: LoginRequestDto,
    examples: {
      loginRequestDto: {
        value: {
          accessToken: 'yg1wdaf(OAuth Access Token)',
          provider: 'KAKAO|APPLE',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: '로그인/회원가입 성공',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: '유효하지 않은 제공자 혹은, 해당 SNS 로그인에 동의하지 않음',
  })
  async oauthLogin(
    @Body() loginRequestdto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const { accessToken, refreshToken, userId } = await this.authService.login(
      loginRequestdto,
    );

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge:
        +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') * 1000,
    });
    return { accessToken, userId };
  }

  @Post('free')
  async freelogin(@Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, userId } =
      await this.authService.freelogin();

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge:
        +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') * 1000,
    });
    return { accessToken, userId };
  }

  @Post('apple')
  @ApiOperation({
    summary: '애플 서버 통신 api',
    description:
      '애플에서 중요한 정보 혹은 업데이트를 위해 요구하는 endpoint입니다.',
  })
  contactApple() {
    return 'ok';
  }

  // 정식 배포 전까지 액세스 토큰을 원활하게 탐색하기 위해 남겨놓았습니다.
  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  @ApiExcludeEndpoint()
  @ApiOperation({
    deprecated: true,
    description: '카카오 계정 테스트를 위한 임시 API',
  })
  deprecatedKakaoLogin(): string {
    return 'success';
  }

  @Get('kakao/redirect')
  @UseGuards(KakaoAuthGuard)
  @ApiExcludeEndpoint()
  @ApiOperation({
    deprecated: true,
    description: '카카오 계정 테스트를 위한 임시 API - Redirect',
  })
  deprecatedKakaoRedirect(@UserRequest() accessToken: AccessToken): void {
    console.log(accessToken);
  }

  @Get('testingapi')
  @ApiExcludeEndpoint()
  test(@Res({ passthrough: true }) res: Response) {
    const accessToken = this.authService.generateAccessToken(1);
    const refreshToken = this.authService.generateRefreshToken(1);
    this.authService.setCurrentRefreshToken(1, refreshToken);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge:
        +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') * 1000,
    });
    return { accessToken };
  }

  @Post('refresh')
  @Auth()
  @ApiOperation({
    description:
      'refesh 토큰을 사용하여 access 토큰을 재발급합니다. RTR로 refresh 토큰도 재발급합니다,',
  })
  @ApiCreatedResponse({
    description: 'access token 재발급 성공',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description:
      '유효하지 않은 refresh token으로 access token 재발급에 실패했습니다.',
  })
  @ApiBadRequestResponse({ description: '유효하지 않은 요청입니다.' })
  async refresh(
    @UserRequest() { userId }: UserPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const prevRefreshToken = req.cookies['refresh_token'];
    const { accessToken, refreshToken } =
      await this.authService.rotateRefreshToken(userId, prevRefreshToken);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge:
        +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') * 1000,
    });
    return { accessToken, userId };
  }

  @Post('logout')
  @HttpCode(204)
  @Auth()
  @ApiOperation({
    description:
      'refresh_token 쿠키를 삭제하고, 유저 테이블에 있는 refresh 토큰을 null로 수정합니다.',
  })
  @ApiNoContentResponse({ description: '로그아웃에 성공했습니다.' })
  @ApiBadRequestResponse({ description: '유효하지 않은 요청입니다.' })
  async logout(
    @UserRequest() { userId }: UserPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.deleteRefreshToken(userId);
    res.clearCookie('refresh_token');
  }

  @Post('withdraw')
  @HttpCode(204)
  @ApiBody({
    description: 'OAuth 액세스 토큰',
    type: WithdrawRequestDto,
    examples: {
      withdrawRequestDto: {
        value: { accessToken: 'yg1wdaf(Ticlmoa Access Token)' },
      },
    },
  })
  @ApiOperation({ description: '회원탈퇴' })
  @ApiNoContentResponse({ description: '회원탈퇴에 성공했습니다.' })
  @ApiBadRequestResponse({ description: '유효하지 않은 OAuth 요청입니다.' })
  async withdraw(
    @Body() withdrawRequestDto: WithdrawRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    // TODO 향후에 액세스토큰 해결 하면 고도화 할 예정
    // await this.authService.withdraw(userId, withdrawRequestDto.accessToken);
    await this.authService.withdraw(withdrawRequestDto.accessToken);
    res.clearCookie('refresh_token');
  }
}
