import { Module } from '@nestjs/common';
import { ActionsModule } from './actions/actions.module';
import { AuthModule } from './auth/auth.module';
import { LocationsModule } from './locations/locations.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [ActionsModule, AuthModule, LocationsModule, LoggerModule],
})
export class AppModule {}
