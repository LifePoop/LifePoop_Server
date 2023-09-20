import { ApiProperty } from '@nestjs/swagger';

export class RefreshResponseBodyDto {
  @ApiProperty()
  accessToken: string;
}
