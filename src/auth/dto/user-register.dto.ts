import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsEmail,
} from 'class-validator';

export class UserRegisterDTO {
  @ApiProperty({ type: 'string', minLength: 4, maxLength: 20 })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    type: 'string',
    minLength: 8,
    maxLength: 20,
    pattern: '/((?=.*d)|(?=.*W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is breakable',
  })
  pass: string;

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
