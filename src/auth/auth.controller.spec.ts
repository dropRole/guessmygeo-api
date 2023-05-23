import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRegisterDTO } from './dto/user-register.dto';
import { ModuleMocker, MockFunctionMetadata, Mock } from 'jest-mock';
import { ConflictException, StreamableFile } from '@nestjs/common';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import { InfoEditDTO } from './dto/info-edit.dto';
import { PassChangeDTO } from './dto/pass-change.dto';
import { join } from 'path';
import { createReadStream } from 'fs';

const moduleMocker: ModuleMocker = new ModuleMocker(global);

export const users: User[] = [
  {
    username: 'laRAD',
    pass: 'laRAD@94',
    name: 'Lazar',
    surname: 'Radosavljević',
    email: 'lazar.radosavljevic@email.com',
    avatar: '1682350582368_avataaars.png',
    locations: [],
    guesses: [],
    actions: [],
  },
  {
    username: 'denhab',
    pass: 'denHab@98',
    name: 'Denis',
    surname: 'Habot',
    email: 'denis.habot@email.com',
    avatar: null,
    locations: [],
    guesses: [],
    actions: [],
  },
];

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        // AuthService dependency injection
        if (token === AuthService)
          return {
            register: jest
              .fn()
              .mockImplementation((userRegisterDTO: UserRegisterDTO): void => {
                const { username } = userRegisterDTO;

                // user already registered
                if (users.find((user) => user.username === username))
                  throw new ConflictException(
                    `Username ${username} is already in use.`,
                  );

                const newUser: User = {
                  ...userRegisterDTO,
                  avatar: null,
                  locations: [],
                  guesses: [],
                  actions: [],
                };

                users.push(newUser);
              }),
            login: jest
              .fn()
              .mockImplementation(
                (authCredentialsDTO: AuthCredentialsDTO): { jwt: string } => {
                  const { username, pass } = authCredentialsDTO;

                  const user: User = users.find(
                    (user) => user.username === username,
                  );

                  // credentials don't match
                  if (user && pass === user.pass) return { jwt: '' };

                  throw new ConflictException('Check your credentials.');
                },
              ),
            selectUsers: jest
              .fn()
              .mockImplementation((search: string): User[] => {
                const found: User[] = users.filter((user) =>
                  user.username.toUpperCase().includes(search.toUpperCase()),
                );

                return found;
              }),
            selectInfo: jest.fn().mockImplementation((user: User) => user),
            editInfo: jest
              .fn()
              .mockImplementation(
                (user: User, infoEditDTO: InfoEditDTO): { jwt: '' } => {
                  const { username } = infoEditDTO;

                  const found: User = users.find(
                    (user) => user.username === username,
                  );

                  // username in use
                  if (found && found.username !== user.username)
                    throw new ConflictException(
                      `Username ${username} is already in use.`,
                    );

                  user = {
                    username,
                    pass: user.pass,
                    ...infoEditDTO,
                    avatar: user.avatar,
                    locations: user.locations,
                    guesses: user.guesses,
                    actions: user.actions,
                  };

                  return { jwt: '' };
                },
              ),
            changePass: jest
              .fn()
              .mockImplementation(
                (user: User, passChangeDTO: PassChangeDTO): void => {
                  const { pass } = passChangeDTO;

                  // invalid current pass
                  if (user.pass !== pass)
                    throw new ConflictException('Invalid current password.');

                  const { newPass } = passChangeDTO;

                  user.pass = newPass;
                },
              ),
            uploadAvatar: jest
              .fn()
              .mockImplementation((user: User, filename: string): string => {
                // already uploaded an avatar
                if (
                  users.find((found) => found.username === user.username).avatar
                )
                  throw new ConflictException('Avatar was already uploaded.');

                user.avatar = filename;

                return filename;
              }),
            removeAvatar: jest.fn(),
          };

        const mockMetadata: MockFunctionMetadata = moduleMocker.getMetadata(
          token,
        ) as MockFunctionMetadata<any, any>;

        const MockDependency: Mock =
          moduleMocker.generateFromMetadata(mockMetadata);

        return new MockDependency();
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    const userRegisterDTO: UserRegisterDTO = new UserRegisterDTO();
    userRegisterDTO.username = 'johndoe';
    userRegisterDTO.pass = 'johnDoe@**';
    userRegisterDTO.name = 'John';
    userRegisterDTO.surname = 'Doe';
    userRegisterDTO.email = 'john.doe@email.com';

    it('should be void', () => {
      expect(
        controller.register({
          username: 'johndoe',
          pass: 'johnDoe@**',
          name: 'John',
          surname: 'Doe',
          email: 'john.doe@email.com',
        }),
      ).toBeUndefined();
    });

    it('should throw a ConflictException', () => {
      userRegisterDTO.username = 'laRAD';

      expect(() => controller.register(userRegisterDTO)).toThrow(
        `Username ${userRegisterDTO.username} is already in use.`,
      );
    });
  });

  describe('login', () => {
    const authCredentialsDTO: AuthCredentialsDTO = new AuthCredentialsDTO();
    authCredentialsDTO.username = 'laRAD';
    authCredentialsDTO.pass = 'laRAD@94';

    it('should return an object holding the token', () => {
      expect(controller.login(authCredentialsDTO)).toStrictEqual({
        jwt: '',
      });
    });

    it('should throw a ConflictException', () => {
      authCredentialsDTO.username = 'larad';

      expect(() => controller.login(authCredentialsDTO)).toThrow(
        'Check your credentials.',
      );
    });
  });

  describe('selectUsers', () => {
    it('should return an Array<User> instance', () => {
      const search = 'larad';

      expect(controller.selectUsers(search)).toBeInstanceOf(Array<User>);
    });
  });

  describe('selectInfo', () => {
    it('should return a User instance', () => {
      const user: User = users[0];

      expect(controller.selectInfo(user)).toStrictEqual(user);
    });
  });

  describe('streamAvatar', () => {
    it('should return a StreamableFile instance', () => {
      expect(controller.streamAvatar(users[0].avatar)).toBeInstanceOf(
        StreamableFile,
      );
    });
  });

  describe('editInfo', () => {
    const user: User = users.find((user) => user.username === 'laRAD');

    const infoEditDTO: InfoEditDTO = new InfoEditDTO();
    infoEditDTO.username = user.username;
    infoEditDTO.name = 'Lazarus';
    infoEditDTO.surname = user.surname;
    infoEditDTO.email = 'catalyst@email.com';

    it('should return an object holding bearer token', () => {
      expect(controller.editInfo(user, infoEditDTO)).toStrictEqual({ jwt: '' });
    });

    it('should throw a ConflictException', () => {
      infoEditDTO.username = 'denhab';

      expect(() => controller.editInfo(user, infoEditDTO)).toThrow(
        `Username ${infoEditDTO.username} is already in use.`,
      );
    });
  });

  describe('changePass', () => {
    const user: User = users.find((user) => user.username === 'laRAD');

    const passChangeDTO: PassChangeDTO = new PassChangeDTO();
    passChangeDTO.pass = 'laRAD@94';
    passChangeDTO.newPass = 'laRad@94';

    it('should be void', () => {
      expect(controller.changePass(user, passChangeDTO)).toBeUndefined();
    });

    it('should throw a ConflictException', () => {
      passChangeDTO.pass = 'LArad@94';

      expect(() => controller.changePass(user, passChangeDTO)).toThrow(
        'Invalid current password.',
      );
    });
  });

  describe('uploadAvatar', () => {
    const avatar: Express.Multer.File = {
      buffer: Buffer.alloc(2048),
      destination: './uploads',
      fieldname: 'avatar',
      filename: '1682350582368_avataaars.png',
      mimetype: 'image/png',
      originalname: '1682350582368_avataaars.png',
      size: 2048,
      path: join(process.cwd(), '/uploads/', ''),
      stream: createReadStream(
        join(process.cwd(), '/uploads/', '1682350582368_avataaars.png'),
      ),
      encoding: 'utf-8',
    };

    it('should return an avatar url', () => {
      expect(controller.uploadAvatar(avatar, users[1])).toStrictEqual(
        avatar.filename,
      );
    });

    it('should throw a ConflictException', () => {
      avatar.mimetype = 'image/jpeg';

      expect(() => controller.uploadAvatar(avatar, users[0])).toThrow(
        'Avatar was already uploaded',
      );
    });
  });

  describe('removeAvatar', () => {
    it('should be void', () => {
      expect(controller.removeAvatar(users[0])).toBeUndefined();
    });
  });
});
