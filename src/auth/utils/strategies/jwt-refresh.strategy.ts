import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, UserPayload } from 'src/auth/types/jwt-payload.interface';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.['refresh_token'],
      ]),
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<UserPayload> {
    const user = await this.userRepository.findOne({
      where: { id: payload.id },
    });
    if (user === null) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }
    return { userId: user.id };
  }
}
