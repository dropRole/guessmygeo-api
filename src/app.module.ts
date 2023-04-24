import { Module } from '@nestjs/common';
import { ActionsModule } from './actions/actions.module';
import { AuthModule } from './auth/auth.module';
import { LocationsModule } from './locations/locations.module';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfigValidationSchema } from './env-config.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PGDriverOptions } from './constants';

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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: PGDriverOptions,
    }),
  ],
})
export class AppModule {}
