import { HttpException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh-token') {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info !== undefined) {
      switch (info.message) {
        case 'No auth token':
        case 'jwt expired':
        case 'invalid signature':
        case 'invalid token':
        case 'jwt malformed':
          context.getResponse().clearCookie('refresh_token');
          throw new HttpException(info.message, 445);
        default:
      }
    }
    return super.handleRequest(err, user, info, context, status);
  }
}
