import { Module } from '@nestjs/common';
import { UtilityLoggerService } from './logger.service';

@Module({
  providers: [UtilityLoggerService],
  exports: [UtilityLoggerService],
})
export class LoggerModule {}
