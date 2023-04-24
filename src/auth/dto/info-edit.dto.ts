import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class InfoEditDTO {
  @ApiProperty({ type: 'string', minLength: 4, maxLength: 20 })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty({ type: 'string', maxLength: 35 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(35)
  name: string;

  @ApiProperty({ type: 'string', maxLength: 35 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(35)
  surname: string;

  @ApiProperty({ type: 'string', maxLength: 320 })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(320)
  email: string;
}
