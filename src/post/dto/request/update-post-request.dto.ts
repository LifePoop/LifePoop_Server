import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt } from 'class-validator';

export class UpdatePostRequestDto {
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
}
