import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class LocationsFilterDTO {
  @ApiProperty({ type: 'number', description: 'Pagination limit' })
  @IsNumberString()
  @IsNotEmpty()
  limit: number;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  user: string;
}
