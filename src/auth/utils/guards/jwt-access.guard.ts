import { HttpException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt-access-token') {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info !== undefined) {
      switch (info.message) {
        case 'No auth token':
        case 'jwt expired':
        case 'invalid signature':
        case 'invalid token':
        case 'jwt malformed':
          throw new HttpException(info.message, 444);
        default:
      }
    }
    return super.handleRequest(err, user, info, context, status);
  }
}
