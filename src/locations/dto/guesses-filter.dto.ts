import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNotEmpty,
  IsNumberString,
  IsUUID,
  IsString,
} from 'class-validator';

export class GuessesFilterDTO {
  @ApiProperty({
    type: 'string',
    description: 'Results limitation',
  })
  @IsNumberString()
  @IsNotEmpty()
  limit: number;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Location guesser',
  })
  @IsOptional()
  @IsString()
  user: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'identification of the location record',
  })
  @IsOptional()
  @IsUUID()
  id: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Personal, best or worst, location guess results',
  })
  @IsOptional()
  @IsNumberString()
  results: number;
}
