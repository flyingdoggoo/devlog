export interface FollowProfileUser {
  id: string;
  name: string | null;
  username: string;
  avatarUrl: string | null;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  active: boolean;
  createdAt: string;
  follower?: FollowProfileUser;
  following?: FollowProfileUser;
}

export interface CreateFollowDto {
  toUserId: string;
}
