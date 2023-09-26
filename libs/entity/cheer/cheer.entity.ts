import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';

@Entity('cheer')
export class Cheer {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.id, {
    createForeignKeyConstraints: false,
  })
  fromUser: User;

  @ManyToOne(() => User, (user) => user.id, {
    createForeignKeyConstraints: false,
  })
  toUser: User;

  @ApiProperty({ example: '2000-04-04' })
  @IsDate()
  @Column()
  date!: Date;
}
