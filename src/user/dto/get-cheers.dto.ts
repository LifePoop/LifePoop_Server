import { Cheer } from '@app/entity/cheer/cheer.entity';
import { User } from '@app/entity/user/user.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';

export class GetCheersRequestParamDto extends PickType(Cheer, ['date']) {}

export class GetCheersResponseThumbDto extends PickType(User, [
  'nickname',
  'characterColor',
  'characterShape',
]) {}

export class GetCheersResponseBodyDto {
  @ApiProperty()
  count!: number;

  @ApiProperty({ type: [GetCheersResponseThumbDto] })
  thumbs!: GetCheersResponseThumbDto[];
}