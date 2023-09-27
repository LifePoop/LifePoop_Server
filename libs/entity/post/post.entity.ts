import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('post')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  isGood: boolean;

  @Column()
  color: number;

  @Column()
  size: number;

  @Column()
  shape: number;

  @Column()
  writerId: number;

  @ManyToOne(() => User, (user) => user.post, {
    createForeignKeyConstraints: false,
  })
  writer: User;

  @Index()
  @Column()
  date: Date;
}
