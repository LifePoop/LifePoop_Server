import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../post/post.entity';
import { Exclude } from 'class-transformer';
import { AuthProvider } from '../types/auth-provider.enum';
import { Friendship } from '../friendship/friendship.entity';
import { IsDate, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Story } from '../story/stroy.entity';

export enum SexEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

@Entity('user')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @MaxLength(20)
  @Column({ length: 20 })
  nickname!: string;

  @ApiProperty()
  @IsDate()
  @Column()
  birth!: Date;

  @ApiProperty({ enum: SexEnum })
  @IsEnum(SexEnum)
  @Column({
    type: 'enum',
    enum: SexEnum,
  })
  sex!: SexEnum;

  @ApiProperty()
  @Column({ nullable: true })
  characterColor?: number;

  @ApiProperty()
  @Column({ nullable: true })
  characterShape?: number;

  @OneToMany(() => Post, (post) => post.writer, {
    createForeignKeyConstraints: false,
  })
  post!: Post[];

  @OneToMany(() => Friendship, (friendship) => friendship.from_user, {
    createForeignKeyConstraints: false,
  })
  fromFriendship!: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.to_user, {
    createForeignKeyConstraints: false,
  })
  toFriendship!: Friendship[];

  @ApiProperty()
  @Column()
  inviteCode!: string;

  @ApiProperty()
  @Exclude()
  @Column({
    length: 300,
    nullable: true,
  })
  refreshToken?: string;

  @ApiProperty({ enum: AuthProvider })
  @IsEnum(AuthProvider)
  @Column({
    type: 'enum',
    enum: AuthProvider,
  })
  provider!: AuthProvider;

  @ApiProperty()
  @Index()
  @Column({ length: 100 })
  snsId!: string;

  @OneToMany(() => Story, (story) => story.writer, {
    createForeignKeyConstraints: false,
  })
  story!: Story[];
}
