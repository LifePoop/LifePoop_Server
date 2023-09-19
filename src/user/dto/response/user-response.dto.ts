import { SexEnum } from '@app/entity/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UserResponseDto {
  @ApiProperty()
  id!: number;

  @IsString()
  @ApiProperty()
  nickname!: string;

  @IsString()
  @ApiProperty()
  email?: string;

  @IsDate()
  @ApiProperty()
  birth!: Date;

  @ApiProperty({ enum: SexEnum })
  @IsEnum(SexEnum)
  sex!: SexEnum;

  @IsNumber()
  @ApiProperty()
  characterColor?: number;

  @IsNumber()
  @ApiProperty()
  characterShape?: number;

  constructor(
    id: number,
    nickname: string,
    email: string,
    birth: Date,
    sex: SexEnum,
    characterColor: number,
    characterShape: number,
  ) {
    this.id = id;
    this.nickname = nickname;
    this.email = email;
    this.birth = birth;
    this.sex = sex;
    this.characterColor = characterColor;
    this.characterShape = characterShape;
  }
}
