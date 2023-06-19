import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
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

  @Column({ length: 20 })
  writerId: number;

  @ManyToOne(() => User, (user) => user.post, {
    createForeignKeyConstraints: false,
  })
  writer: User;

  @Column({ length: 20 })
  date: Date;
}
