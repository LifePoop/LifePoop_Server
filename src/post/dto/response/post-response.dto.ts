import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsInt, IsNumber } from 'class-validator';

export class PostResponseDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  writerId: number;

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
