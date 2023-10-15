import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AppleWithdrawRequestBodyDto {
  @ApiProperty()
  @IsString()
  authorizationCode: string;
}
