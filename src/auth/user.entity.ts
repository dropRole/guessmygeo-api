import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Action } from '../actions/action.entity';
import { Guess } from '../locations/guess.entity';
import { Location } from '../locations/location.entity';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  username: string;

  @Column({ type: 'varchar', length: 64 })
  @Exclude()
  pass: string;

  @Column({ type: 'varchar', length: 35 })
  name: string;

  @Column({ type: 'varchar', length: 35 })
  surname: string;

  @Column({ type: 'varchar', length: 320 })
  email: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @OneToMany((_type) => Location, (location) => location.user)
  locations: Location[];

  @OneToMany((_type) => Guess, (guess) => guess.user)
  guesses: Guess[];

  @OneToMany((_type) => Action, (action) => action.user)
  actions: Action[];
}
