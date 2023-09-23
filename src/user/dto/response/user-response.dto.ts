import { SexEnum, User } from '@app/entity/user/user.entity';
import { PickType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto extends PickType(User, [
  'id',
  'nickname',
  'birth',
  'sex',
  'characterColor',
  'characterShape',
]) {
  @Expose() id!: number;
  @Expose() nickname!: string;
  @Expose() birth!: Date;
  @Expose() sex!: SexEnum;
  @Expose() characterColor!: number;
  @Expose() characterShape!: number;
}
