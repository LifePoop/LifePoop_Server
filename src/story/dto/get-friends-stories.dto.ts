import { Story } from '@app/entity/story/stroy.entity';
import { User } from '@app/entity/user/user.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class GetFriendsStoriesResponseUserDto extends PickType(User, [
  'id',
  'nickname',
  'characterColor',
  'characterShape',
]) {
  @Expose() id!: number;
  @Expose() nickname!: string;
  @Expose() characterColor!: number;
  @Expose() characterShape!: number;

  @ApiProperty()
  @Expose()
  isCheered!: boolean;
}

export class GetFriendsStoriesResponseBodyElementDto {
  @ApiProperty()
  user!: GetFriendsStoriesResponseUserDto;

  @ApiProperty({ type: [Story] })
  @Type(() => Story)
  stories!: Story[];
}

// @Exclude()
// export class GetFriendsStoriesResponseBodyElementDto extends PickType(Story, [
//   'id',
//   'date',
// ]) {
//   @Expose() id!: number;
//   @Expose() date!: Date;

//   @ApiProperty()
//   @Expose()
//   isViewed!: boolean;

//   @ApiProperty()
//   @Expose()
//   writer!: GetFriendsStoriesResponseUserDto;
// }
