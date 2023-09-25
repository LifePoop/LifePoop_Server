import { Injectable } from '@nestjs/common';
import { StoryRepository } from './stroy.repository';
import { Story } from '@app/entity/story/stroy.entity';
import { In, MoreThan } from 'typeorm';
import { UserStoryViewRepository } from './user-story-view.repository';
import { FriendshipRepository } from 'src/user/friendship.repository';
import {
  GetFriendsStoriesResponseBodyElementDto,
  GetFriendsStoriesResponseUserDto,
} from './dto/get-friends-stories.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class StoryService {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly userStoryViewRepository: UserStoryViewRepository,
    private readonly friendshipRepository: FriendshipRepository,
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
      writerId,
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
          writerId: friendId,
        },
        order: { date: 'DESC' },
        relations: ['writer'],
      });
    });
    const recentStories = (await Promise.all(storiesPromises)).filter(Boolean); // filter(Boolean)은 null, undefined, false를 제거함
    if (recentStories.length === 0) return [];

    const viewedStories = await this.userStoryViewRepository.find({
      where: {
        viewer: { id: userId },
        story: { id: In(recentStories.map((rs) => rs.id)) },
      },
    });

    const result = recentStories.map((rs) => ({
      id: rs.id,
      isViewed: viewedStories.map((vs) => vs.id).includes(rs.id),
      date: rs.date,
      user: plainToInstance(GetFriendsStoriesResponseUserDto, rs.writer),
    }));

    return result.sort((a, b) => {
      if (a.isViewed !== b.isViewed) {
        return a.isViewed ? 1 : -1;
      }
      return b.date.getTime() - a.date.getTime();
    });
  }
}
