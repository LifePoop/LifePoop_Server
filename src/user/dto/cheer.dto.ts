import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CheerRequestParamDto {
  @ApiProperty()
  @IsNumber()
  toUserId!: number;
}
