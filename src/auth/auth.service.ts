import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './auth/user.entity';
import { Repository, Like } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRegisterDTO } from './dto/user-register.dto';
import * as bcrypt from 'bcrypt';
import { JWTPayload } from './jwt-payload.interface';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { InfoEditDTO } from './dto/info-edit.dto';
import { PassChangeDTO } from './dto/pass-change.dto';
import { unlink } from 'fs';
import { UtilityLoggerService } from '../logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private utilityLoggerService: UtilityLoggerService,
  ) {
    this.utilityLoggerService.setContext('AuthService');
  }

  async register(userRegisterDTO: UserRegisterDTO): Promise<void> {
    const { username } = userRegisterDTO;

    let user: User;
    try {
      user = await this.usersRepo.findOne({ where: { username } });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // username already in use
    if (user)
      throw new ConflictException(`Username ${username} is already in use.`);

    const { pass, name, surname, email } = userRegisterDTO;

    const hash: string = await bcrypt.hash(pass, 9);

    user = this.usersRepo.create({
      username,
      pass: hash,
      name,
      surname,
      email,
    });

    try {
      await this.usersRepo.insert(user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.utilityLoggerService.instanceCreationLog(user);
  }

  private signJWT(username: string): { jwt: string } {
    const payload: JWTPayload = { username };

    const jwt: string = this.jwtService.sign(payload);

    return { jwt };
  }

  async login(
    authCredentialsDTO: AuthCredentialsDTO,
  ): Promise<{ jwt: string }> {
    const { username, pass } = authCredentialsDTO;

    const user: User = await this.usersRepo.findOne({ where: { username } });

    // registered user
    if (user && (await bcrypt.compare(pass, user.pass)))
      return this.signJWT(username);

    // superuser login
    if (
      username === this.configService.get('SUPERUSER') &&
      (await bcrypt.compare(pass, this.configService.get('SUPERUSER_PASS')))
    )
      return this.signJWT(username);

    throw new UnauthorizedException('Check your credentials.');
  }

  async selectUsers(search: string): Promise<User[]> {
    try {
      const users: User[] = await this.usersRepo.find({
        where: { username: Like(`%${search}%`) },
      });

      this.utilityLoggerService.instanceSelectionLog('User', users.length);

      return users;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async editInfo(
    user: User,
    infoEditDTO: InfoEditDTO,
  ): Promise<{ jwt: string }> {
    const { username, name, surname, email } = infoEditDTO;

    let exist = false;
    // username already in use
    if (username !== user.username)
      exist = await this.usersRepo.exist({ where: { username } });

    const oldUser: User = structuredClone(user);

    // username not already in use
    if (!exist) user.username = username;
    user.name = name;
    user.surname = surname;
    user.email = email;
    try {
      await this.usersRepo.update(oldUser, user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.utilityLoggerService.instanceUpdateLog(user);

    // username already in use
    if (exist)
      throw new ConflictException(`Username ${username} is already in use.`);
    else return this.signJWT(username);
  }

  async changePass(user: User, passChangeDTO: PassChangeDTO): Promise<void> {
    const { pass, newPass } = passChangeDTO;

    // invalid current password
    if (!(await bcrypt.compare(pass, user.pass)))
      throw new ConflictException('Invalid current password.');

    const oldUser: User = structuredClone(user);

    const hash: string = await bcrypt.hash(newPass, 9);

    user.pass = hash;

    try {
      await this.usersRepo.update(oldUser, { pass: hash });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.utilityLoggerService.instanceUpdateLog(user);
  }

  async uploadAvatar(
    user: User,
    filename: string,
  ): Promise<{ filename: string }> {
    // avatar already uploaded
    if (user.avatar) {
      unlink(`uploads/${filename}`, (err) => {
        if (err) throw new InternalServerErrorException(err.message);
      });

      throw new ConflictException('Avatar has already been uploaded.');
    }

    user.avatar = filename;

    try {
      await this.usersRepo.save(user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.utilityLoggerService.instanceUpdateLog(user);

    return { filename };
  }

  async removeAvatar(user: User): Promise<void> {
    unlink(`uploads/${user.avatar}`, (err) => {
      if (err) throw new InternalServerErrorException(err.message);
    });

    user.avatar = null;

    try {
      await this.usersRepo.save(user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.utilityLoggerService.instanceUpdateLog(user);
  }
}
