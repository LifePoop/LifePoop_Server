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

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  nickname: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  birth: Date;

  @Column()
  sex: number;

  @Column()
  characterColor: number;

  @Column()
  characterShape: number;

  @OneToMany(() => Post, (post) => post.writer, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  post: Post[];

  @Exclude()
  @Column({ type: 'varchar', length: 300, nullable: true })
  refreshToken?: string;

  @Column({ type: 'enum', enum: AuthProvider })
  provider!: AuthProvider;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  snsId!: string;
}
