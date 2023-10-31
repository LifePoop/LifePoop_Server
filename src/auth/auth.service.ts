import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
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
import { SexEnum } from '@app/entity/user/user.entity';
import { AppleWithdrawRequestBodyDto } from './dto/apple-withdraw.dto';
import { UserPayload } from './types/jwt-payload.interface';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CheerRepository } from 'src/user/cheer.repository';
import { StoryRepository } from 'src/story/stroy.repository';
import { PostRepository } from 'src/post/post.repository';
import { FriendshipRepository } from 'src/user/friendship.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly cheerRepository: CheerRepository,
    private readonly storyRepository: StoryRepository,
    private readonly postRepository: PostRepository,
    private readonly friendShipRepository: FriendshipRepository,
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
      characterColor: 0,
      characterShape: 0,
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

  async appleWithdraw(
    input: AppleWithdrawRequestBodyDto & UserPayload,
  ): Promise<void> {
    const { authorizationCode, userId } = input;

    const privateKey = readFileSync(
      join(process.cwd(), 'bin', `AuthKey.p8`),
    ).toString();

    const token = this.jwtService.sign(
      { aud: 'https://appleid.apple.com' },
      {
        header: {
          alg: 'ES256',
          kid: this.configService.get('APPLE_KID'),
        },
        subject: this.configService.get('APPLE_CLIENT_ID'),
        expiresIn: 1000 * 60 * 5,
        issuer: this.configService.get('APPLE_ISS'),
        secret: privateKey,
      },
    );

    const tokenResponse = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.configService.get('APPLE_CLIENT_ID'),
        client_secret: token,
        grant_type: 'authorization_code',
        code: authorizationCode,
      }),
    });
    if (tokenResponse.status !== HttpStatus.OK) {
      throw new BadRequestException('애플 로그아웃에 실패했습니다. 1');
    }

    const { access_token: accessToken } = await tokenResponse.json();

    const revokeResponse = await fetch(
      'https://appleid.apple.com/auth/revoke',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.configService.get('APPLE_CLIENT_ID'),
          client_secret: token,
          token: accessToken,
          token_type_hint: 'access_token',
        }),
      },
    );
    if (revokeResponse.status !== HttpStatus.OK) {
      throw new BadRequestException('애플 로그아웃에 실패했습니다. 2');
    }

    await this.#clearUserHistory(userId);
  }

  async kakaoWithdraw(userPayload: UserPayload): Promise<void> {
    const { userId } = userPayload;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const unlinkBody = await fetch('https://kapi.kakao.com/v1/user/unlink', {
      method: 'POST',
      headers: {
        Authorization: `KakaoAK ${this.configService.get('KAKAO_ADMIN_KEY')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        target_id_type: 'user_id',
        target_id: user.snsId,
      }),
    }).then((res) => res.json());
    if (unlinkBody.id !== user.snsId) {
      throw new BadRequestException('카카오 로그아웃에 실패했습니다.');
    }

    await this.#clearUserHistory(userId);
  }

  async #clearUserHistory(userId: number): Promise<void> {
    const stories = await this.storyRepository.find({
      where: { writer: { id: userId } },
    });

    const posts = await this.postRepository.find({
      where: { writer: { id: userId } },
    });

    const cheers = await this.cheerRepository.find({
      where: [{ fromUser: { id: userId } }, { toUser: { id: userId } }],
    });

    const friendships = await this.friendShipRepository.find({
      where: [{ from_user: { id: userId } }, { to_user: { id: userId } }],
    });

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    // 다 찾아오면 일괄 삭제
    await this.userRepository.remove(user);
    await this.friendShipRepository.remove(friendships);
    await this.cheerRepository.remove(cheers);
    await this.storyRepository.remove(stories);
    await this.postRepository.remove(posts);
  }

  async testLogin(testUserId: number): Promise<TokenResponse> {
    const user = await this.userRepository.findOne({
      where: { id: testUserId },
    });

    let userId: number;

    if (user === null) {
      let inviteCode = generateRandomString(8);
      while ((await this.userRepository.count({ where: { inviteCode } })) > 0) {
        inviteCode = generateRandomString(8);
      }

      const { id } = await this.userRepository.save({
        id: testUserId,
        snsId: `lifepoo_${testUserId}`,
        nickname: `테스트계정_${testUserId}`,
        provider:
          testUserId % 2 === 0 ? AuthProvider.KAKAO : AuthProvider.APPLE,
        sex: testUserId % 2 === 0 ? SexEnum.MALE : SexEnum.FEMALE,
        birth: new Date('2000-04-04'),
        characterColor: Math.floor(Math.random() * 5) + 1,
        characterShape: Math.floor(Math.random() * 3) + 1,
        inviteCode,
      });

      userId = id;
    } else {
      userId = user.id;
    }

    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    await this.#setCurrentRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }
}
