import { Module } from '@nestjs/common';
import { UtilityLoggerService } from './logger.service';

@Module({
  providers: [UtilityLoggerService],
})
export class LoggerModule {}
