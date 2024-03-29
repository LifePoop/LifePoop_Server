import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UserRequest } from '../common/decorators/user-request.decorator';
import { AuthService } from './auth.service';
import { AccessToken } from './types/token-response.interface';
import { KakaoAuthGuard } from './utils/guards/kakao-auth.guard';
import { UserPayload } from './types/jwt-payload.interface';
import { Auth } from './decorator/auth.decorator';

import {
  RegisterRequestBodyDto,
  RegisterRequestParamDto,
  RegisterResponseBodyDto,
} from './dto/register.dto';
import {
  LoginRequestBodyDto,
  LoginRequestParamDto,
  LoginResponseBodyDto,
} from './dto/login.dto';
import { Cookies } from './decorator/cookies.decorator';
import { RefreshResponseBodyDto } from './dto/refresh.dto';
import { AppleWithdrawRequestBodyDto } from './dto/apple-withdraw.dto';
import { AuthProvider } from '@app/entity/types/auth-provider.enum';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post(':provider/register')
  @ApiOperation({
    summary: '회원가입',
    description: 'accessToken을 발급 받고, refresh_token을 쿠키에 저장',
  })
  @ApiCreatedResponse({
    description: '회원가입 성공',
    type: RegisterResponseBodyDto,
  })
  @ApiConflictResponse({ description: '이미 존재하는 유저입니다.' })
  @ApiBadRequestResponse({ description: '카카오/애플 로그인에 실패했습니다.' })
  async register(
    @Param() registerRequestParamDto: RegisterRequestParamDto,
    @Body() registerRequestBodyDto: RegisterRequestBodyDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponseBodyDto> {
    const { accessToken, refreshToken } = await this.authService.register({
      ...registerRequestParamDto,
      ...registerRequestBodyDto,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge:
        +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') * 1000,
    });
    return { accessToken };
  }

  @Post(':provider/login')
  @ApiOperation({
    summary: '로그인',
    description: 'accessToken을 발급 받고, refresh_token을 쿠키에 저장',
  })
  @ApiCreatedResponse({
    description: '로그인 성공',
    type: LoginResponseBodyDto,
  })
  @ApiNotFoundResponse({ description: '존재하지 않는 유저입니다.' })
  @ApiBadRequestResponse({ description: '카카오/애플 로그인에 실패했습니다.' })
  async login(
    @Param() loginRequestParamDto: LoginRequestParamDto,
    @Body() loginRequestBodyDto: LoginRequestBodyDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseBodyDto> {
    const { accessToken, refreshToken } = await this.authService.login({
      ...loginRequestParamDto,
      ...loginRequestBodyDto,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge:
        +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') * 1000,
    });
    return { accessToken };
  }

  @Auth('refresh')
  @Post('refresh')
  @ApiOperation({
    summary: '토큰 재발급',
    description: '쿠키에 있는 refresh_token으로 access/refresh 토큰 재발급',
  })
  @ApiCreatedResponse({
    description: '토큰 재발급 성공',
    type: RefreshResponseBodyDto,
  })
  @ApiForbiddenResponse({
    description:
      '해당 유저의 refresh_token이 아닌 token으로 재발급을 시도하므로, 강제 로그아웃(쿠키에 있는 refresh_token 삭제)',
  })
  async refresh(
    @UserRequest() { userId }: UserPayload,
    @Cookies('refresh_token') prevRefreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponseBodyDto> {
    try {
      const { accessToken, refreshToken } =
        await this.authService.rotateRefreshToken(userId, prevRefreshToken);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        maxAge:
          +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') * 1000,
      });

      return { accessToken };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        res.clearCookie('refresh_token');
      }
      throw error;
    }
  }

  @Auth('access')
  @Post('logout')
  @HttpCode(204)
  @ApiOperation({
    summary: '로그아웃',
    description: '쿠키에 있는 refresh_token 삭제',
  })
  @ApiNoContentResponse({ description: '로그아웃에 성공했습니다.' })
  async logout(
    @UserRequest() { userId }: UserPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.deleteRefreshToken(userId);
    res.clearCookie('refresh_token');
  }

  @Auth('access')
  @Post(`${AuthProvider.APPLE}/withdraw`)
  @HttpCode(204)
  @ApiOperation({ summary: '애플 회원 탈퇴' })
  @ApiNoContentResponse({ description: '회원 탈퇴 성공' })
  async appleWithdraw(
    @Body() { authorizationCode }: AppleWithdrawRequestBodyDto,
    @UserRequest() { userId }: UserPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.appleWithdraw({ userId, authorizationCode });
    res.clearCookie('refresh_token');
  }

  @Auth('access')
  @Post(`${AuthProvider.KAKAO}/withdraw`)
  @HttpCode(204)
  @ApiOperation({ summary: '카카오 회원 탈퇴' })
  @ApiNoContentResponse({ description: '회원 탈퇴 성공' })
  async kakaoWithdraw(
    @UserRequest() userPayload: UserPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.kakaoWithdraw(userPayload);
    res.clearCookie('refresh_token');
  }

  ///////////////////////////// 테스트용 /////////////////////////////

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

  @Post('test-login/:userId')
  @ApiOperation({
    summary: '테스트 로그인',
    description: 'accessToken을 발급 받고, refresh_token을 쿠키에 저장',
  })
  @ApiCreatedResponse({
    description: '테스트 로그인 성공',
    type: LoginResponseBodyDto,
  })
  async testLogin(
    @Param('userId') userId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseBodyDto> {
    const { accessToken, refreshToken } = await this.authService.testLogin(
      userId,
    );

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge:
        +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') * 1000,
    });

    return { accessToken };
  }
}
