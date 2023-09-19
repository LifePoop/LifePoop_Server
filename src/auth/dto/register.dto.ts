import { User } from '@app/entity/user/user.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterRequestParamDto extends PickType(User, ['provider']) {}

export class RegisterRequestBodyDto extends PickType(User, [
  'nickname',
  'birth',
  'sex',
]) {
  @ApiProperty()
  @IsString()
  oAuthAccessToken: string;
}

export class RegisterResponseBodyDto {
  @ApiProperty()
  @IsString()
  accessToken: string;
}
