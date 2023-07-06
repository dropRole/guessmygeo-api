import { Test, TestingModule } from '@nestjs/testing';
import { LocationsController } from './locations.controller';
import { ModuleMocker, MockFunctionMetadata, Mock } from 'jest-mock';
import { LocationsService } from './locations.service';
import { LocationCreateDTO } from './dto/location-create.dto';
import { users } from '../auth/auth.controller.spec';
import { join } from 'path';
import { createReadStream } from 'fs';
import { randomBytes } from 'crypto';
import { LocationGuessDTO } from './dto/location-guess.dto';
import { Location } from './location.entity';
import {
  NotFoundException,
  StreamableFile,
  UnauthorizedException,
} from '@nestjs/common';
import { Guess } from './guess.entity';
import { User } from '../auth/user.entity';
import { LocationsFilterDTO } from './dto/locations-filter.dto';
import { GuessesFilterDTO } from './dto/guesses-filter.dto';
import { LocationEditDTO } from './dto/location-edit.dto';
import { ReadStream } from 'typeorm/platform/PlatformTools';

const moduleMocker: ModuleMocker = new ModuleMocker(global);

const image: Express.Multer.File = {
  buffer: Buffer.alloc(5358777),
  destination: './uploads',
  fieldname: 'image',
  filename: '1682356991387_paris.jpg',
  mimetype: 'image/jpeg',
  originalname: '1682356991387_paris.jpg',
  path: join(process.cwd(), '/uploads/', '1682356991387_paris.jpg'),
  size: 5358777,
  stream: createReadStream(
    join(process.cwd(), '/uploads/', '1682356991387_paris.jpg'),
  ),
  encoding: 'utf-8',
};

const locations: Location[] = [
  {
    id: crypto.randomUUID(),
    lat: 50,
    lon: 0,
    image: image.filename,
    caption: 'City has an eye',
    createdAt: new Date(),
    editedAt: new Date(),
    user: users[0],
    guesses: [],
  },
];

const guesses: Guess[] = [
  {
    id: crypto.randomUUID(),
    result: 250,
    location: locations[0],
    guessedAt: new Date(),
    user: users[0],
  },
];

describe('LocationsController', () => {
  let controller: LocationsController;
  let service: LocationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
    })
      .useMocker((token) => {
        // LocationsService dependancy injection
        if (token === LocationsService)
          return {
            createLocation: jest.fn(),
            guessLocation: jest
              .fn()
              .mockImplementation(
                (
                  user: User,
                  locationGuessDTO: LocationGuessDTO,
                  id: string,
                ): void => {
                  // location not found
                  if (!locations.find((location) => location.id === id))
                    throw new NotFoundException(
                      `Location ${id} was not found.`,
                    );

                  const newGuess: Guess = {
                    id: crypto.randomUUID(),
                    ...locationGuessDTO,
                    user,
                    guessedAt: new Date(),
                    location: locations.find((location) => location.id === id),
                  };

                  guesses.push(newGuess);
                },
              ),
            selectLocations: jest
              .fn()
              .mockImplementation(
                (locationsFilterDTO: LocationsFilterDTO): Location[] => {
                  const { limit, user } = locationsFilterDTO;

                  return locations
                    .filter((location) => location.user.username === user)
                    .slice(0, limit);
                },
              ),
            selectLocation: jest.fn().mockImplementation((id: string) => {
              const location: Location | undefined = locations.find(
                (location) => location.id === id,
              );

              // location found
              if (location) return location;

              throw new NotFoundException(`Location ${id} was not found.`);
            }),
            guessedLocation: jest
              .fn()
              .mockImplementation((user: User, id: string): boolean => {
                const guess: Guess | undefined = guesses.find(
                  (guess) => guess.location.id === id,
                );

                // location guess
                if (guess)
                  if (guess.user.username === user.username) return true;
                  else return false;

                throw new NotFoundException(`Location ${id} was not found.`);
              }),
            selectRandLocation: jest
              .fn()
              .mockImplementation(
                (): Location =>
                  locations[
                    locations.length === 0
                      ? 0
                      : Math.floor(Math.random() * locations.length)
                  ] as Location,
              ),
            streamImage: jest
              .fn()
              .mockImplementation((filename: string): StreamableFile => {
                const stream: ReadStream = createReadStream(filename);

                return new StreamableFile(stream);
              }),
            selectGuesses: jest
              .fn()
              .mockImplementation(
                (guessesFilterDTO: GuessesFilterDTO): Guess[] => {
                  const { limit, user, id, results } = guessesFilterDTO;

                  // location not found
                  if (
                    !locations.find(
                      (location) =>
                        location.id === id && location.user.username === user,
                    )
                  )
                    throw new NotFoundException(
                      `Location ${id} was not found.`,
                    );

                  return guesses
                    .filter((guess) => guess.location.id === id)
                    .sort(() => (results ? 0 : 1))
                    .slice(0, limit);
                },
              ),
            selectGuess: jest.fn().mockImplementation((id: string): Guess => {
              const guess: Guess | undefined = guesses.find(
                (guess) => guess.id === id,
              );

              // guess found
              if (guess) return guess;

              throw new NotFoundException(`Guess ${id} was not found.`);
            }),
            editLocation: jest
              .fn()
              .mockImplementation(
                (
                  user: User,
                  id: string,
                  locationEditDTO: LocationEditDTO,
                  filename: string,
                ): void => {
                  let location: Location = locations.find(
                    (location) => location.id === id,
                  );

                  // location not found
                  if (!location)
                    throw new NotFoundException(
                      `Location ${id} was not found.`,
                    );

                  location = {
                    id: id,
                    lat: location.lat,
                    lon: location.lon,
                    createdAt: location.createdAt,
                    editedAt: new Date(),
                    image: filename,
                    ...locationEditDTO,
                    user,
                    guesses: location.guesses,
                  };
                },
              ),
            removeLocation: jest
              .fn()
              .mockImplementation((user: User, id: string): void => {
                const location: Location = locations.find(
                  (location) => location.id === id,
                );

                // not authorized
                if (location.user.username !== user.username)
                  throw new UnauthorizedException(
                    `Unauthorized deletion attempt of the ${id} location.`,
                  );

                locations.splice(locations.indexOf(location), 1);
              }),
          };

        const mockMetadata: MockFunctionMetadata = moduleMocker.getMetadata(
          token,
        ) as MockFunctionMetadata<any, any>;

        const MockDependency: Mock =
          moduleMocker.generateFromMetadata(mockMetadata);

        return new MockDependency();
      })
      .compile();

    controller = module.get<LocationsController>(LocationsController);
    service = module.get<LocationsService>(LocationsService);
  });

  describe('createLocation', () => {
    it('should be void', () => {
      const locationCreateDTO: LocationCreateDTO = new LocationCreateDTO();
      locationCreateDTO.lat = 45;
      locationCreateDTO.lon = 15;
      locationCreateDTO.image = randomBytes(image.size);
      locationCreateDTO.caption = 'City of love, lights and fashion';

      expect(
        controller.createLocation(users[0], locationCreateDTO, image),
      ).toBeUndefined();
    });
  });

  describe('guessLocation', () => {
    const locationGuessDTO: LocationGuessDTO = new LocationGuessDTO();
    locationGuessDTO.result = 250;

    it('should be void', () => {
      expect(
        controller.guessLocation(users[0], locationGuessDTO, locations[0].id),
      ).toBeUndefined();
    });

    it('should throw a ConflictException', () => {
      expect(() =>
        controller.guessLocation(
          users[0],
          locationGuessDTO,
          locations[0].id.substring(0, locations[0].id.length - 1),
        ),
      ).toThrow(
        `Location ${locations[0].id.substring(
          0,
          locations[0].id.length - 1,
        )} was not found.`,
      );
    });
  });

  describe('selectLocations', () => {
    it('should return an array of Location instances', () => {
      const locationsFilterDTO: LocationsFilterDTO = new LocationsFilterDTO();
      locationsFilterDTO.limit = 5;
      locationsFilterDTO.user = users[0].username;

      expect(controller.selectLocations(locationsFilterDTO)).toBeInstanceOf(
        Array<Location>,
      );
    });
  });

  describe('selectLocation', () => {
    it('should return a Location instance', () => {
      expect(controller.selectLocation(locations[0].id)).toMatchObject(
        new Location(),
      );
    });

    it('should throw a NotFoundException', () => {
      const id: string = locations[0].id.substring(
        0,
        locations[0].id.length - 1,
      );

      expect(() => controller.selectLocation(id)).toThrow(
        `Location ${id} was not found.`,
      );
    });
  });

  describe('guessedLocation', () => {
    it('should be truthy', () => {
      expect(
        controller.guessedLocation(locations[0].user, locations[0].id),
      ).toBeTruthy();
    });

    it('should throw a NotFoundException', () => {
      expect(() =>
        controller.guessedLocation(
          locations[0].user,
          locations[0].id.substring(0, locations[0].id.length - 1),
        ),
      ).toThrow(
        `Location ${locations[0].id.substring(
          0,
          locations[0].id.length - 1,
        )} was not found.`,
      );
    });
  });

  describe('selectRandLocation', () => {
    it('should return a Location instance', () => {
      service.selectRandLocation();
      expect(service.selectRandLocation).toHaveReturned();
    });
  });

  describe('streamImage', () => {
    it('should return a StreamableFile instance', () => {
      expect(controller.streamImage(locations[0].image)).toBeInstanceOf(
        StreamableFile,
      );
    });
  });

  describe('selectGuesses', () => {
    const guessesFilterDTO: GuessesFilterDTO = new GuessesFilterDTO();
    guessesFilterDTO.limit = 5;
    guessesFilterDTO.user = locations[0].user.username;
    guessesFilterDTO.id = locations[0].id;
    guessesFilterDTO.results = 1;

    it('should return an array of Guess instances', () => {
      expect(controller.selectGuesses(guessesFilterDTO)).toBeInstanceOf(
        Array<Guess>,
      );
    });

    it('should throw a NotFoundException', () => {
      guessesFilterDTO.id = locations[0].id.substring(
        0,
        locations[0].id.length - 1,
      );

      expect(() => controller.selectGuesses(guessesFilterDTO)).toThrow(
        `Location ${locations[0].id.substring(
          0,
          locations[0].id.length - 1,
        )} was not found.`,
      );
    });
  });

  describe('selectGuess', () => {
    it('should return a Guess instance', () => {
      expect(controller.selectGuess(guesses[0].id)).toMatchObject(new Guess());
    });

    it('should throw a NotFoundException', () => {
      const id: string = guesses[0].id.substring(0, guesses[0].id.length - 1);

      expect(() => controller.selectGuess(id)).toThrow(
        `Guess ${id} was not found.`,
      );
    });
  });

  describe('editLocation', () => {
    const locationEditDTO: LocationEditDTO = new LocationEditDTO();
    locationEditDTO.image = image.filename;
    locationEditDTO.caption = 'Pecham district is in it';

    it('should be void', () => {
      expect(
        controller.editLocation(
          users[0],
          locationEditDTO,
          locations[0].id,
          image,
        ),
      ).toBeUndefined();
    });

    it('should throw a NotFoundException', () => {
      expect(() =>
        controller.editLocation(
          users[0],
          locationEditDTO,
          locations[0].id.substring(0, locations[0].id.length - 1),
          image,
        ),
      ).toThrow(
        `Location ${locations[0].id.substring(
          0,
          locations[0].id.length - 1,
        )} was not found.`,
      );
    });
  });

  describe('removeLocation', () => {
    it('should throw a UnauthorizedException', () => {
      expect(() =>
        controller.removeLocation(users[1], locations[0].id),
      ).toThrow(
        `Unauthorized deletion attempt of the ${locations[0].id} location.`,
      );
    });

    it('should be void', () => {
      expect(
        controller.removeLocation(users[0], locations[0].id),
      ).toBeUndefined();
    });
  });
});
