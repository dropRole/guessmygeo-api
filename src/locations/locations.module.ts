import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './location.entity';
import { Guess } from './guess.entity';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Location, Guess]), LoggerModule],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
