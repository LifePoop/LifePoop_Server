import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { UserStoryView } from '../user-story-view/user-story-view.entity';

@Entity('story')
export class Story {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  color!: number;

  @Column()
  size!: number;

  @Column()
  shape!: number;

  @Column()
  writerId!: number;

  @ManyToOne(() => User, (user) => user.story, {
    createForeignKeyConstraints: false,
  })
  writer!: User;

  @Column()
  date!: Date;

  @OneToMany(() => UserStoryView, (userStoryView) => userStoryView.story, {
    createForeignKeyConstraints: false,
  })
  userStoryView!: UserStoryView[];
}
