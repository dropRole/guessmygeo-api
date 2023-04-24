import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class LocationEditDTO {
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
