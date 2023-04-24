import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Action } from './actions/action.entity';
import { User } from './auth/user.entity';
import { Location } from './locations/location.entity';
import { Guess } from './locations/guess.entity';
import { Migration1682344128716 } from './migrations/1682344128716-Migration';

const configService: ConfigService = new ConfigService();

export const MigrationsDataSource: DataSource = new DataSource({
  type: 'postgres',
  host: configService.get('PG_HOST'),
  port: configService.get('PG_PORT'),
  database: configService.get('PG_DB'),
  username: configService.get('PG_USER'),
  password: configService.get('PG_PASS'),
  entities: [Action, User, Location, Guess],
  migrations: [Migration1682344128716],
});
