import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsString, IsOptional } from 'class-validator';

export class ActionsFilterDTO {
  @ApiProperty({
    type: 'string',
    description: 'Limitation on record selection',
  })
  @IsNumberString()
  limit: number;

  @ApiPropertyOptional({
    type: 'string',
    description: 'User search string',
  })
  @IsOptional()
  @IsString()
  search: string;
}
