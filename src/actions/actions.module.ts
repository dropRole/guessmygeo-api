import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Action } from './action.entity';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Action]), ConfigModule, LoggerModule],
  controllers: [ActionsController],
  providers: [ActionsService],
})
export class ActionsModule {}
