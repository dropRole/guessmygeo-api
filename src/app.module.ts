import { Module } from '@nestjs/common';
import { ActionsModule } from './actions/actions.module';
import { AuthModule } from './auth/auth.module';
import { LocationsModule } from './locations/locations.module';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { EnvConfigValidationSchema } from './env-config.schema';

@Module({
  imports: [
    ActionsModule,
    AuthModule,
    LocationsModule,
    LoggerModule,
    ConfigModule.forRoot({
      envFilePath: `.env.stage.${process.env.STAGE}`,
      validationSchema: EnvConfigValidationSchema,
    }),
  ],
})
export class AppModule {}
