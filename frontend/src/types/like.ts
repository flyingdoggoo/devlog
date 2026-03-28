// Rename to avoid conflict - like.ts already exists in types
export interface LikeEntity {
  id: string;
  postId: string;
  userId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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
