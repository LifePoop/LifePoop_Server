import { Story } from '@app/entity/story/stroy.entity';
import { User } from '@app/entity/user/user.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class GetFriendsStoriesResponseUserDto extends PickType(User, [
  'nickname',
  'characterColor',
  'characterShape',
]) {
  @Expose() nickname!: string;
  @Expose() characterColor!: number;
  @Expose() characterShape!: number;
}

@Exclude()
export class GetFriendsStoriesResponseBodyElementDto extends PickType(Story, [
  'id',
  'date',
]) {
  @Expose() id!: number;
  @Expose() date!: Date;

  @ApiProperty()
  @Expose()
  isViewed!: boolean;

  @ApiProperty()
  @Expose()
  writer!: GetFriendsStoriesResponseUserDto;
}
