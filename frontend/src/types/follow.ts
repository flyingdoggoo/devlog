import { User } from './user';

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  follower?: User;
  following?: User;
}

export interface CreateFollowDto {
  toUserId: string;
}
