import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider } from '@app/entity/types/auth-provider.enum';
import { UserRepository } from '../user/user.repository';
import { ConfigService } from '@nestjs/config';
import { TokenResponse } from './types/token-response.interface';
import jwksClient from 'jwks-rsa';
import { UpdateResult } from 'typeorm';
import {
  RegisterRequestBodyDto,
  RegisterRequestParamDto,
} from './dto/register.dto';
import { generateRandomString } from 'libs/utils/utils';
import { LoginRequestBodyDto, LoginRequestParamDto } from './dto/login.dto';
import { JwtSubjectEnum } from './types/jwt-subject.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async register(
    input: RegisterRequestBodyDto & RegisterRequestParamDto,
  ): Promise<TokenResponse> {
    const { oAuthAccessToken, provider, nickname, sex, birth } = input;

    const snsId = await this.#getOAuthUserInfo(oAuthAccessToken, provider);

    const existedUser = await this.userRepository.findOne({
      where: { snsId },
    });
    if (existedUser !== null) {
      throw new ConflictException('이미 존재하는 유저입니다.');
    }

    let inviteCode = generateRandomString(8);
    while ((await this.userRepository.count({ where: { inviteCode } })) > 0) {
      inviteCode = generateRandomString(8);
    }

    const { id: userId } = await this.userRepository.save({
      snsId,
      nickname,
      provider,
      sex,
      birth,
      characterColor: Math.floor(Math.random() * 5) + 1,
      characterShape: Math.floor(Math.random() * 3) + 1,
      inviteCode,
    });

    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    await this.#setCurrentRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async login(
    input: LoginRequestParamDto & LoginRequestBodyDto,
  ): Promise<TokenResponse> {
    const { oAuthAccessToken, provider } = input;

    const snsId = await this.#getOAuthUserInfo(oAuthAccessToken, provider);

    const existedUser = await this.userRepository.findOne({
      where: { snsId },
    });
    if (existedUser === null) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    const accessToken = this.generateAccessToken(existedUser.id);
    const refreshToken = this.generateRefreshToken(existedUser.id);

    await this.#setCurrentRefreshToken(existedUser.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async #getOAuthUserInfo(
    oAuthAccessToken: string,
    provider: AuthProvider,
  ): Promise<string> {
    switch (provider) {
      case AuthProvider.KAKAO: {
        const response = await fetch('https://kapi.kakao.com/v2/user/me', {
          headers: { Authorization: `Bearer ${oAuthAccessToken}` },
        });
        const { id } = await response.json();
        if (id === undefined) {
          throw new BadRequestException('카카오 로그인에 실패했습니다.');
        }
        return String(id);
      }
      case AuthProvider.APPLE: {
        const json = this.jwtService.decode(oAuthAccessToken, {
          complete: true,
        });
        const kid = json['header'].kid;
        const appleKey = await this.#getAppleSigningKey(kid);
        if (!appleKey) {
          throw new BadRequestException('애플 로그인에 실패했습니다. 1');
        }
        const { sub } = this.jwtService.verify(oAuthAccessToken, {
          algorithms: ['RS256'],
          secret: appleKey,
        });
        if (sub === undefined) {
          throw new BadRequestException('애플 로그인에 실패했습니다. 2');
        }

        return String(sub);
      }
    }
  }

  async #getAppleSigningKey(kid: string): Promise<string> {
    // Public key 생성을 위해 요청 전송
    const client = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });

    const key = await client.getSigningKey(kid);

    return key.getPublicKey();
  }

  generateAccessToken(userId: number): string {
    return this.jwtService.sign(
      { id: userId },
      {
        subject: JwtSubjectEnum.ACCESS,
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: `${this.configService.get(
          'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
        )}s`,
      },
    );
  }

  generateRefreshToken(userId: number): string {
    return this.jwtService.sign(
      { id: userId },
      {
        subject: JwtSubjectEnum.REFRESH,
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: `${this.configService.get(
          'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
        )}s`,
      },
    );
  }

  #setCurrentRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<UpdateResult> {
    return this.userRepository.update(userId, { refreshToken });
  }

  async rotateRefreshToken(
    userId: number,
    prevRefreshToken: string,
  ): Promise<TokenResponse> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        refreshToken: prevRefreshToken,
      },
    });

    if (user === null) {
      throw new ForbiddenException(
        '유효하지 않은 접근입니다. 재로그인 해주세요.',
      );
    }

    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    await this.#setCurrentRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  // TODO 향후 고도화
  // async withdraw(userId: number, accessToken: string): Promise<void> {
  async withdraw(accessToken: string): Promise<void> {
    try {
      // const { provider } = await this.userRepository.findOne({ where: { id: userId } });
      // let url: string,
      //   method = 'GET';
      // switch (provider) {
      //   case AuthProvider.KAKAO: {
      //     url = 'https://kapi.kakao.com/v1/user/unlink';
      //     break;
      //   }
      //   case AuthProvider.NAVER: {
      //     url = `https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=${this.configService.get(
      //       'NAVER_CLIENT_ID',
      //     )}&client_secret=${this.configService.get(
      //       'NAVER_SECRET',
      //     )}&access_token=${accessToken}&service_provider=NAVER`;
      //     break;
      //   }
      //   case AuthProvider.GOOGLE: {
      //     url = `https://oauth2.googleapis.com/revoke?token=${accessToken}`;
      //     method = 'POST';
      //     break;
      //   }
      //   case AuthProvider.NYONG: {
      //     await this.userRepository.softDelete(userId);
      //     return;
      //   }
      //   default: {
      //     throw new BadRequestException();
      //   }
      // }
      // await axios({
      //   url,
      //   method,
      //   headers: { Authorization: `Bearer ${accessToken}` },
      // });
      const userId = this.jwtService.decode(accessToken)['id'];
      await this.userRepository.softDelete(userId);
    } catch {
      throw new UnauthorizedException('유효하지 않은 OAuth 요청입니다.');
    }
  }
}
