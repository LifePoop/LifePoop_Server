// import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
// import { User } from '../user/user.entity';
// import { Story } from '../story/stroy.entity';

// @Entity('user_story_view')
// export class UserStoryView {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @ManyToOne(() => User, (user) => user.id, {
//     createForeignKeyConstraints: false,
//   })
//   viewer!: User;

//   @ManyToOne(() => Story, (story) => story.userStoryView, {
//     createForeignKeyConstraints: false,
//   })
//   story!: Story;

//   @Column()
//   date!: Date;
// }
