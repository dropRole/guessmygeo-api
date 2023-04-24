import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './location.entity';
import { Guess } from './guess.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Location, Guess])],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
