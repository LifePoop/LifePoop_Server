import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UpdateUserRequestDto {
  @IsString()
  @ApiProperty()
  nickname!: string;

  @IsNumber()
  @ApiProperty()
  characterColor!: number;

  @IsNumber()
  @ApiProperty()
  characterShape!: number;
}
