import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('story')
export class Story {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty()
  @Column()
  color!: number;

  @ApiProperty()
  @Column()
  size!: number;

  @ApiProperty()
  @Column()
  shape!: number;

  @ManyToOne(() => User, (user) => user.story, {
    createForeignKeyConstraints: false,
  })
  writer!: User;

  @ApiProperty()
  @Index()
  @Column()
  date!: Date;

  // @OneToMany(() => UserStoryView, (userStoryView) => userStoryView.story, {
  //   createForeignKeyConstraints: false,
  // })
  // userStoryView!: UserStoryView[];
}
