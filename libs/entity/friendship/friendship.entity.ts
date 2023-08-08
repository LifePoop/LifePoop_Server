import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('friendship')
export class Friendship {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.fromFriendship, {
    createForeignKeyConstraints: false,
  })
  from_user: User;

  @ManyToOne(() => User, (user) => user.toFriendship, {
    createForeignKeyConstraints: false,
  })
  to_user: User;
}
