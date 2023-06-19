import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../post/post.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  nickname: string;

  @Column()
  email: string;

  @Column({ length: 20 })
  birth: Date;

  @Column({ length: 20 })
  sex: number;

  @Column({ length: 20 })
  characterColor: number;

  @Column({ length: 20 })
  characterShape: number;

  @OneToMany(() => Post, (post) => post.writer, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  post: Post[];
}
