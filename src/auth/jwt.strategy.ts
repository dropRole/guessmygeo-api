import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JWTPayload } from './jwt-payload.interface';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(jwtPayload: JWTPayload) {
    const { username } = jwtPayload;

    const superuser: string = this.configService.get('SUPERUSER');

    // superuser homologation
    if (username === superuser) {
      return {
        username: superuser,
        pass: this.configService.get('SUPERUSER_PASS'),
      };
    }

    let user: User;
    try {
      user = await this.userRepo.findOne({ where: { username } });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // registered user
    if (user) return user;
  }
}
