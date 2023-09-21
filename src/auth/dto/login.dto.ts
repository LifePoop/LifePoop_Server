import { User } from '@app/entity/user/user.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginRequestParamDto extends PickType(User, ['provider']) {}

export class LoginRequestBodyDto {
  @ApiProperty()
  @IsString()
  oAuthAccessToken: string;
}

export class LoginResponseBodyDto {
  @ApiProperty()
  accessToken: string;
}
