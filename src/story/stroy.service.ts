import { Injectable, NotFoundException } from '@nestjs/common';
import { StoryRepository } from './stroy.repository';
import { Story } from '@app/entity/story/stroy.entity';
import { In, MoreThan } from 'typeorm';
import { UserStoryViewRepository } from './user-story-view.repository';
import { FriendshipRepository } from 'src/user/friendship.repository';
import { GetFriendsStoriesResponseBodyElementDto } from './dto/get-friends-stories.dto';
import { plainToInstance } from 'class-transformer';
import { GetStoryResponseBodyDto } from './dto/get-story.dto';
import { CheerRepository } from 'src/user/cheer.repository';
import { convertDayStart } from 'libs/utils/convert-day';
import { PostRepository } from 'src/post/post.repository';

@Injectable()
export class StoryService {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly userStoryViewRepository: UserStoryViewRepository,
    private readonly friendshipRepository: FriendshipRepository,
    private readonly cheerRepository: CheerRepository,
    private readonly postRepository: PostRepository,
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

  async getFriendsStories(
    userId: number,
  ): Promise<GetFriendsStoriesResponseBodyElementDto[]> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const friendshipIds = await this.friendshipRepository.findFriendshipIds(
      userId,
    );

    const storiesPromises = friendshipIds.map(async (friendId) => {
      return this.storyRepository.findOne({
        where: {
          date: MoreThan(oneDayAgo),
          writer: { id: friendId },
        },
        order: { date: 'DESC' },
        relations: ['writer'],
      });
    });
    const recentStories = (await Promise.all(storiesPromises)).filter(Boolean); // filter(Boolean)은 null, undefined, false를 제거함
    if (recentStories.length === 0) return [];

    const userStoryViews = await this.userStoryViewRepository.find({
      where: {
        viewer: { id: userId },
        story: { id: In(recentStories.map((rs) => rs.id)) },
      },
      relations: ['story'],
    });

    const result = recentStories.map((rs) => ({
      isViewed: userStoryViews.map((usv) => usv.story.id).includes(rs.id),
      ...rs,
    }));

    const sortedResult = result.sort((a, b) => {
      if (a.isViewed !== b.isViewed) {
        return a.isViewed ? 1 : -1;
      }
      return b.date.getTime() - a.date.getTime();
    });

    return plainToInstance(
      GetFriendsStoriesResponseBodyElementDto,
      sortedResult,
      {
        enableImplicitConversion: true,
      },
    );
  }

  async getStoryAndMarkAsViewed(
    storyId: number,
    userId: number,
  ): Promise<GetStoryResponseBodyDto> {
    const story = await this.storyRepository.findOne({
      where: { id: storyId },
      relations: ['writer'],
    });
    if (!story) throw new NotFoundException('존재하지 않는 스토리');

    const userCheer = await this.cheerRepository.findOne({
      where: {
        fromUser: { id: userId },
        toUser: { id: story.writer.id },
        date: MoreThan(convertDayStart(new Date())),
      },
    });
    const isCheered = userCheer === null ? false : true;

    const todayPostCount = await this.postRepository.count({
      where: {
        writer: { id: story.writer.id },
        date: MoreThan(convertDayStart(new Date())),
      },
    });

    const userStoryView = await this.userStoryViewRepository.findOne({
      where: {
        viewer: { id: userId },
        story: { id: storyId },
      },
    });
    if (userStoryView === null) {
      await this.userStoryViewRepository.save({
        viewer: { id: userId },
        story: { id: storyId },
        date: new Date(),
      });
    }

    return plainToInstance(
      GetStoryResponseBodyDto,
      { ...story, isCheered, todayPostCount },
      {
        enableImplicitConversion: true,
      },
    );
  }
}
