import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsInt } from 'class-validator';

export class CreatePostRequestDto {
  @ApiProperty()
  @IsBoolean()
  isGood: boolean;

  @ApiProperty()
  @IsInt()
  color: number;

  @ApiProperty()
  @IsInt()
  size: number;

  @ApiProperty()
  @IsInt()
  shape: number;

  @ApiProperty()
  @IsDate()
  date: Date;
}
