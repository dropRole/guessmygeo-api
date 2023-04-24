import { User } from '../auth/user.entity';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('actions')
@Index(['id', 'user'])
export class Action {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 6 })
  @Check("type IN('Click', 'Scroll', 'Input')")
  type: string;

  @Column({ type: 'varchar', length: 10 })
  component: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column({ type: 'text' })
  url: string;

  @CreateDateColumn()
  performedAt: Date;

  @ManyToOne((_type) => User, (user) => user.actions, {
    nullable: false,
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user', referencedColumnName: 'username' })
  user: User;
}
