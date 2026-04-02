export interface Like {
  id: string;
  postId: string;
  userId: string;
  active: boolean;
  createdAt: string;
}

export interface LikeUser {
  id: string;
  name: string | null;
}

export interface LikeWithUser {
  id: string;
  postId: string;
  userId: string;
  active: boolean;
  user?: LikeUser;
}

