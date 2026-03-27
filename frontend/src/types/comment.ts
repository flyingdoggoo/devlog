import { User } from './user';

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  author?: User;
  replies?: Comment[];
}

export interface CreateCommentDto {
  content: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  content: string;
}
