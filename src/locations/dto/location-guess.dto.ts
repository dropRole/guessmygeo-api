import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsNotEmpty } from 'class-validator';

export class LocationGuessDTO {
  @ApiProperty({
    type: 'string',
    description: 'Result of the location guess',
  })
  @IsNumberString()
  @IsNotEmpty()
  result: number;
}
