import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './location.entity';
import { Repository, SelectQueryBuilder, InsertResult } from 'typeorm';
import { Guess } from './guess.entity';
import { LocationCreateDTO } from './dto/location-create.dto';
import { User } from '../auth/user.entity';
import { LocationsFilterDTO } from './dto/locations-filter.dto';
import { unlink } from 'fs';
import { LocationGuessDTO } from './dto/location-guess.dto';
import { LocationEditDTO } from './dto/location-edit.dto';
import { UtilityLoggerService } from '../logger/logger.service';
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
  ): Promise<{ [key: string]: boolean | string }> {
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

    let idGuesses: string;
    try {
      const result: InsertResult = await this.guessesRepo.insert(guess);

      idGuesses = result.identifiers[0].id;
    } catch (error) {
      return { message: error.message };
    }

    this.utilityLoggerService.instanceCreationLog(guess);

    return { id: idGuesses };
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

  async selectLocation(id: string): Promise<Location> {
    let location: Location;
    try {
      location = await this.locationsRepo.findOne({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // was not found
    if (!location)
      throw new NotFoundException(`Location with the id ${id} was not found.`);

    return location;
  }

  async guessedLocation(user: User, id: string): Promise<string | false> {
    let guess: Guess;
    try {
      guess = await this.guessesRepo.findOne({
        where: { location: { id }, user },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // user guessed location
    if (guess) return guess.id;

    return false;
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
    const { limit, user, id, results } = guessesFilterDTO;

    const query: SelectQueryBuilder<Guess> =
      this.guessesRepo.createQueryBuilder('guess');
    query.innerJoinAndSelect('guess.location', 'location');
    query.innerJoinAndSelect('guess.user', 'guesser');

    // particular location guesses
    if (id) query.where('guess.location = :location', { location: id });

    // personal guesses
    if (user) query.where('guess.guesser = :guesser', { guesser: user });

    query.orderBy('guess.result', results ? 'ASC' : 'DESC');

    query.take(limit);

    let guesses: Guess[];
    try {
      guesses = await query.getMany();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.utilityLoggerService.instanceSelectionLog('Guess', limit);

    return guesses;
  }

  async selectGuess(id: string): Promise<Guess> {
    let guess: Guess;
    try {
      guess = await this.guessesRepo.findOne({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // guess record was not found
    if (!guess) throw new NotFoundException(`The guess ${id} was not found.`);

    return guess;
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
      limit: 1,
      id,
      user: undefined,
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
