import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ActionsRemoveDTO {
  @ApiProperty({
    type: 'string',
    description: 'JSON representation of an array of action ids',
  })
  @IsString()
  @IsNotEmpty()
  actions: string;
}
