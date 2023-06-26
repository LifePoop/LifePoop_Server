import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AuthProvider } from '@app/entity/types/auth-provider.enum';

export class LoginRequestDto {
  @IsString()
  @IsNotEmpty()
  accessToken!: string;

  @IsEnum(AuthProvider)
  @IsNotEmpty()
  provider!: string;
}
