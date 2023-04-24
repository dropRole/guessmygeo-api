import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './location.entity';
import { Repository, SelectQueryBuilder, FindOptionsOrderValue } from 'typeorm';
import { Guess } from './guess.entity';
import { LocationCreateDTO } from './dto/location-create.dto';
import { User } from 'src/auth/user.entity';
import { LocationsFilterDTO } from './dto/locations-filter.dto';
import { unlink } from 'fs';
import { LocationGuessDTO } from './dto/location-guess.dto';
import { LocationEditDTO } from './dto/location-edit.dto';
import { UtilityLoggerService } from 'src/logger/logger.service';
import { GuessesFilterDTO } from './dto/guesses-filter.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location) private locationsRepo: Repository<Location>,
    @InjectRepository(Guess) private guessesRepo: Repository<Guess>,
    private utilityLoggerService: UtilityLoggerService,
  ) {
    this.utilityLoggerService.setContext('LocationsService');
  }

  async createLocation(
    user: User,
    locationCreateDTO: LocationCreateDTO,
    filename: string,
  ): Promise<void> {
    const { lat, lon, caption } = locationCreateDTO;

    const location: Location = this.locationsRepo.create({
      lat,
      lon,
      image: filename,
      caption: caption ? caption : null,
      user,
    });

    try {
      await this.locationsRepo.insert(location);
    } catch (error) {
      unlink(`uploads/${location.image}`, (err) => {
        if (err) throw new InternalServerErrorException(err.message);
      });

      throw new InternalServerErrorException(error.message);
    }

    this.utilityLoggerService.instanceCreationLog(location);
  }

  async guessLocation(
    user: User,
    locationGuessDTO: LocationGuessDTO,
    id: string,
  ): Promise<void> {
    const { result } = locationGuessDTO;

    let location: Location;
    try {
      location = await this.locationsRepo.findOne({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // not found
    if (!location) throw new NotFoundException(`Location ${id} was not found.`);

    const guess: Guess = this.guessesRepo.create({ result, location, user });

    try {
      await this.guessesRepo.insert(guess);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.utilityLoggerService.instanceCreationLog(guess);
  }

  async selectLocations(
    locationsFilterDTO: LocationsFilterDTO,
  ): Promise<Location[]> {
    const { limit, user } = locationsFilterDTO;

    try {
      const locations: Location[] = await this.locationsRepo.find({
        loadEagerRelations: true,
        where: user ? { user: { username: user } } : {},
        take: limit,
        order: { createdAt: 'DESC' },
      });

      this.utilityLoggerService.instanceSelectionLog('Location', limit);

      return locations;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async selectRandLocation(): Promise<Location> {
    const query: SelectQueryBuilder<Location> =
      this.locationsRepo.createQueryBuilder('location');
    query.innerJoinAndSelect('location.user', 'user');
    query.orderBy('random()');

    try {
      const location: Location = (await query.getMany())[0];

      this.utilityLoggerService.instanceSelectionLog('Location', 1);

      return location;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async selectGuesses(guessesFilterDTO: GuessesFilterDTO): Promise<Guess[]> {
    const { id } = guessesFilterDTO;

    let location: Location;
    try {
      location = await this.locationsRepo.findOne({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // not found
    if (!location) throw new NotFoundException(`Location ${id} was not found.`);

    const { limit } = guessesFilterDTO;
    try {
      const guesses: Guess[] = await this.guessesRepo.find({
        where: { location: { id } },
        order: { result: 'ASC' },
        take: limit,
      });

      this.utilityLoggerService.instanceSelectionLog('Guess', guesses.length);

      return guesses;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async selectPersonalGuesses(
    user: User,
    guessesFilterDTO: GuessesFilterDTO,
  ): Promise<Guess[]> {
    const { results, limit } = guessesFilterDTO;

    const resultOrder: FindOptionsOrderValue = results == 1 ? 'ASC' : 'DESC';

    try {
      const guesses: Guess[] = await this.guessesRepo.find({
        where: { user },
        take: limit,
        order: { result: resultOrder },
      });

      this.utilityLoggerService.instanceSelectionLog('Guess', limit);

      return guesses;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async editLocation(
    user: User,
    id: string,
    locationEditDTO: LocationEditDTO,
    filename: string,
  ): Promise<void> {
    const { caption } = locationEditDTO;

    let location: Location;
    try {
      location = await this.locationsRepo.findOne({
        where: { id },
      });
    } catch (error) {
      unlink(`uploads/${filename}`, (err) => {
        if (err) throw new InternalServerErrorException(err.message);
      });

      throw new InternalServerErrorException(error.message);
    }

    // not found
    if (!location) {
      unlink(`uploads/${filename}`, (err) => {
        if (err) throw new InternalServerErrorException(err.message);
      });

      throw new NotFoundException(`Location ${id} was not found.`);
    }

    // unauthorized for the location
    if (location.user.username !== user.username) {
      unlink(`uploads/${filename}`, (err) => {
        if (err) throw new InternalServerErrorException(err.message);
      });

      throw new UnauthorizedException(
        `Unauthorized edit attempt of the ${id} location.`,
      );
    }

    unlink(`uploads/${location.image}`, (err) => {
      if (err) throw new InternalServerErrorException(err.message);
    });

    location.image = filename;
    location.caption = caption;

    try {
      await this.locationsRepo.save(location);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.utilityLoggerService.instanceUpdateLog(location);
  }

  async removeLocation(user: User, id: string): Promise<void> {
    let location: Location;
    try {
      location = await this.locationsRepo.findOne({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // not found
    if (!location) throw new NotFoundException(`Location ${id} was not found.`);

    // unauthorized for the location
    if (location.user.username !== user.username)
      throw new UnauthorizedException(
        `Unauthorized deletion attempt of the ${id} location.`,
      );

    const guesses: Guess[] = await this.selectGuesses({
      id,
      limit: 1,
      results: 1,
    });

    // guesses were made
    if (guesses.length !== 0)
      throw new ConflictException(
        `Cannot delete location ${id} due to guesses made.`,
      );

    try {
      await this.locationsRepo.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    unlink(`uploads/${location.image}`, (err) => {
      if (err) throw new InternalServerErrorException(err.message);
    });

    this.utilityLoggerService.instanceDeletionLog(location.constructor.name, 1);
  }
}
