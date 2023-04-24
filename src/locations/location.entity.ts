import { User } from '../auth/user.entity';
import { Guess } from '../locations/guess.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric', precision: 8, scale: 6 })
  lat: number;

  @Column({ type: 'numeric', precision: 9, scale: 6 })
  lon: number;

  @Column({ type: 'text' })
  image: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  caption: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  editedAt: Date;

  @ManyToOne((_type) => User, (user) => user.locations, {
    nullable: false,
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user', referencedColumnName: 'username' })
  @Index()
  user: User;

  @OneToMany((_type) => Guess, (guess) => guess.location)
  guesses: Guess[];
}
