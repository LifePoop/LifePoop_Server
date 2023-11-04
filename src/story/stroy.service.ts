import { Injectable } from '@nestjs/common';
import { StoryRepository } from './stroy.repository';
import { Story } from '@app/entity/story/stroy.entity';
import { MoreThan } from 'typeorm';
import { FriendshipRepository } from 'src/user/friendship.repository';
import { plainToInstance } from 'class-transformer';
import { UserRepository } from 'src/user/user.repository';
import { GetFriendsStoriesResponseBodyElementDto } from './dto/get-friends-stories.dto';
import { convertDayStart } from 'libs/utils/convert-day';
import { CheerRepository } from 'src/user/cheer.repository';

@Injectable()
export class StoryService {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly friendshipRepository: FriendshipRepository,
    private readonly userRepository: UserRepository,
    private readonly cheerRepository: CheerRepository,
  ) {}

  async createPostStory(
    color: number,
    size: number,
    shape: number,
    writerId: number,
    date: Date,
  ): Promise<Story> {
    const { id } = await this.storyRepository.save({
      color,
      size,
      shape,
      writer: { id: writerId },
      date,
    });

    return await this.storyRepository.findOne({
      where: { id },
    });
  }

  async getFriendsStories(userId: number) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const friendshipIds = await this.friendshipRepository.findFriendshipIds(
      userId,
    );

    const friendshipsStories = friendshipIds.map(async (friendshipId) => {
      const user = await this.userRepository.findOne({
        where: { id: friendshipId },
      });

      // 위 user에게 userId의 유저가 오늘 응원을 했는지 확인
      const userCheer = await this.cheerRepository.findOne({
        where: {
          fromUser: { id: userId },
          toUser: { id: friendshipId },
          date: MoreThan(convertDayStart(new Date())),
        },
      });
      const isCheered = userCheer === null ? false : true;

      const stories = await this.storyRepository.find({
        where: {
          date: MoreThan(oneDayAgo),
          writer: { id: friendshipId },
        },
        order: { date: 'DESC' },
      });

      if (stories.length === 0) return null;

      return { user: { ...user, isCheered }, stories };
    });

    const results = (await Promise.all(friendshipsStories)).filter(Boolean); // filter(Boolean)은 null, undefined, false를 제거함

    const sortedResults = results.sort(
      (a, b) => b.stories[0].id - a.stories[0].id,
    );

    return plainToInstance(
      GetFriendsStoriesResponseBodyElementDto,
      sortedResults,
      {
        enableImplicitConversion: true,
      },
    );
  }

  // async getFriendsStories(
  //   userId: number,
  // ): Promise<GetFriendsStoriesResponseBodyElementDto[]> {
  //   const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  //   const friendshipIds = await this.friendshipRepository.findFriendshipIds(
  //     userId,
  //   );

  //   const storiesPromises = friendshipIds.map(async (friendId) => {
  //     return this.storyRepository.findOne({
  //       where: {
  //         date: MoreThan(oneDayAgo),
  //         writer: { id: friendId },
  //       },
  //       order: { date: 'DESC' },
  //       relations: ['writer'],
  //     });
  //   });
  //   const recentStories = (await Promise.all(storiesPromises)).filter(Boolean); // filter(Boolean)은 null, undefined, false를 제거함
  //   if (recentStories.length === 0) return [];

  //   const userStoryViews = await this.userStoryViewRepository.find({
  //     where: {
  //       viewer: { id: userId },
  //       story: { id: In(recentStories.map((rs) => rs.id)) },
  //     },
  //     relations: ['story'],
  //   });

  //   const result = recentStories.map((rs) => ({
  //     isViewed: userStoryViews.map((usv) => usv.story.id).includes(rs.id),
  //     ...rs,
  //   }));

  //   const sortedResult = recentStories.sort((a, b) => {
  //     if (a.isViewed !== b.isViewed) {
  //       return a.isViewed ? 1 : -1;
  //     }
  //     return b.date.getTime() - a.date.getTime();
  //   });

  //   return plainToInstance(
  //     GetFriendsStoriesResponseBodyElementDto,
  //     sortedResult,
  //     {
  //       enableImplicitConversion: true,
  //     },
  //   );
  // }

  // async getStoryAndMarkAsViewed(
  //   storyId: number,
  //   userId: number,
  // ): Promise<GetStoryResponseBodyDto> {
  //   const story = await this.storyRepository.findOne({
  //     where: { id: storyId },
  //     relations: ['writer'],
  //   });
  //   if (!story) throw new NotFoundException('존재하지 않는 스토리');

  //   const userCheer = await this.cheerRepository.findOne({
  //     where: {
  //       fromUser: { id: userId },
  //       toUser: { id: story.writer.id },
  //       date: MoreThan(convertDayStart(new Date())),
  //     },
  //   });
  //   const isCheered = userCheer === null ? false : true;

  //   const todayPostCount = await this.postRepository.count({
  //     where: {
  //       writer: { id: story.writer.id },
  //       date: MoreThan(convertDayStart(new Date())),
  //     },
  //   });

  //   const userStoryView = await this.userStoryViewRepository.findOne({
  //     where: {
  //       viewer: { id: userId },
  //       story: { id: storyId },
  //     },
  //   });
  //   if (userStoryView === null) {
  //     await this.userStoryViewRepository.save({
  //       viewer: { id: userId },
  //       story: { id: storyId },
  //       date: new Date(),
  //     });
  //   }

  //   return plainToInstance(
  //     GetStoryResponseBodyDto,
  //     { ...story, isCheered, todayPostCount },
  //     {
  //       enableImplicitConversion: true,
  //     },
  //   );
  // }
}
