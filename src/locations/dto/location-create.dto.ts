import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class LocationCreateDTO {
  @ApiProperty({
    type: 'string',
    description: 'Latitude coordinate of geolocation',
  })
  @IsNumberString()
  @IsNotEmpty()
  lat: number;

  @ApiProperty({
    type: 'string',
    description: 'Longitude coordinate of geolocation',
  })
  @IsNumberString()
  @IsNotEmpty()
  lon: number;

  @ApiProperty({ type: 'string', format: 'binary' })
  image: any;

  @ApiPropertyOptional({
    type: 'string',
    maxLength: 100,
    description: 'Caption of the taken image',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  caption: string;
}
