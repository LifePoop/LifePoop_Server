import { Story } from '@app/entity/story/stroy.entity';
import { User } from '@app/entity/user/user.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetStoryRequestParamDto {
  @ApiProperty()
  @IsNumber()
  storyId!: number;
}

@Exclude()
export class GetStoryResponseUserDto extends PickType(User, [
  'id',
  'nickname',
  'characterColor',
  'characterShape',
]) {
  @Expose() id!: number;
  @Expose() nickname!: string;
  @Expose() characterColor!: number;
  @Expose() characterShape!: number;
}

@Exclude()
export class GetStoryResponseBodyDto extends PickType(Story, [
  'id',
  'date',
  'color',
  'shape',
  'size',
]) {
  @Expose() id!: number;
  @Expose() date!: Date;
  @Expose() color!: number;
  @Expose() shape!: number;
  @Expose() size!: number;

  @ApiProperty()
  @Expose()
  writer!: GetStoryResponseUserDto;
}
