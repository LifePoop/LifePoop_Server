import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAccessGuard } from '../utils/guards/jwt-access.guard';
import { JwtRefreshGuard } from '../utils/guards/jwt-refresh.guard';

export function Auth(mode: 'access' | 'refresh') {
  switch (mode) {
    case 'access':
      return applyDecorators(
        UseGuards(JwtAccessGuard),
        ApiBearerAuth('access-token'),
        ApiResponse({
          status: 444,
          description: '유효하지 않은 accessToken',
        }),
      );
    case 'refresh':
      return applyDecorators(
        UseGuards(JwtRefreshGuard),
        ApiResponse({
          status: 445,
          description:
            '유효하지 않은 refresh_token, 강제 로그아웃(쿠키에 있는 refresh_token 삭제)',
        }),
        ApiNotFoundResponse({
          description: 'refresh_token의 id와 일치하는 유저 없음',
        }),
      );
  }
}
