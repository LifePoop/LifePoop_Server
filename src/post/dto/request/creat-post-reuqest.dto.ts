import { IsBoolean, IsDate, IsInt, IsNumber } from 'class-validator';

export class CreatePostRequestDto {
  @IsNumber()
  writerId: number;

  @IsBoolean()
  isGood: boolean;

  @IsInt()
  color: number;

  @IsInt()
  size: number;

  @IsInt()
  shape: number;

  @IsDate()
  date: Date;
}
