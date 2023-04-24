import { Location } from '../locations/location.entity';
import { User } from '../auth/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('guesses')
@Index(['user', 'location'])
export class Guess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint' })
  result: number;

  @CreateDateColumn()
  guessedAt: Date;

  @ManyToOne((_type) => User, (user) => user.guesses, {
    eager: true,
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'guesser', referencedColumnName: 'username' })
  user: User;

  @ManyToOne((_type) => Location, (location) => location.guesses, {
    nullable: false,
  })
  @JoinColumn({ name: 'location', referencedColumnName: 'id' })
  location: Location;
}
