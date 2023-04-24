import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ActionType } from '../enum/action-type.enum';

export class ActionRecordDTO {
  @ApiProperty({
    enum: ActionType,
    maxLength: 6,
    description: 'Type of user-performed action',
  })
  @IsEnum(ActionType)
  @IsNotEmpty()
  @MaxLength(6)
  type: ActionType;

  @ApiProperty({
    type: 'string',
    maxLength: 12,
    description: 'UI component on which the action was performed',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  component: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Evaluation on INPUT action',
  })
  @IsOptional()
  @IsString()
  value: string;

  @ApiProperty({
    type: 'string',
    description: 'URL where action was performed',
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
