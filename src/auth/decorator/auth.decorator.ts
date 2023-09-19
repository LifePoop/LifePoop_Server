import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAccessGuard } from '../utils/guards/jwt-access.guard';
import { JwtRefreshGuard } from '../utils/guards/jwt-refresh.guard';

export function Auth(mode: 'access' | 'refresh') {
  switch (mode) {
    case 'access':
      return applyDecorators(
        UseGuards(JwtAccessGuard),
        ApiBearerAuth('access-token'),
      );
    case 'refresh':
      return applyDecorators(UseGuards(JwtRefreshGuard));
  }
}
