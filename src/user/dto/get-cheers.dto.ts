import { Cheer } from '@app/entity/cheer/cheer.entity';
import { User } from '@app/entity/user/user.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GetCheersRequestParamDto extends PickType(Cheer, ['date']) {
  @ApiProperty()
  @IsNumber()
  userId!: number;
}

export class GetCheersResponseThumbDto extends PickType(User, [
  'id',
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
