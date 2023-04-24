import { Controller, Post, Body, Get, Delete, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { ActionRecordDTO } from './dto/action-record.dto';
import { ActionsFilterDTO } from './dto/actions-filter.dto';
import { Action } from './action.entity';
import { ActionsRemoveDTO } from './dto/actions-remove.dto';

@Controller('actions')
@ApiTags('actions')
export class ActionsController {
  @Post()
  @ApiBearerAuth()
  @ApiOkResponse({ type: undefined })
  @ApiOperation({ summary: 'Record a user-performed UI action' })
  recordAction(
    @GetUser() user: User,
    @Body() actionRecordDTO: ActionRecordDTO,
  ): Promise<void> {
    return;
  }

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: [Action] })
  @ApiOperation({
    summary:
      'Select arbitrary number of actions, maximally 100, of the optionally passed user',
  })
  selectActions(
    @Query() actionsFilterDTO: ActionsFilterDTO,
  ): Promise<Action[]> {
    return;
  }

  @Delete()
  @ApiBearerAuth()
  @ApiOkResponse({ type: undefined })
  @ApiOperation({ summary: 'Remove user-performed IU actions' })
  removeActions(@Body() actionsRemoveDTO: ActionsRemoveDTO): Promise<void> {
    return;
  }
}
