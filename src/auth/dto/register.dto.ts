import { User } from '@app/entity/user/user.entity';
import {
  ApiProperty,
  IntersectionType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterRequestParamDto extends PickType(User, ['provider']) {}

export class RegisterRequestBodyDto extends IntersectionType(
  PickType(User, ['nickname']),
  PartialType(PickType(User, ['birth', 'sex'])),
) {
  @ApiProperty()
  @IsString()
  oAuthAccessToken: string;
}

export class RegisterResponseBodyDto {
  @ApiProperty()
  accessToken: string;
}
