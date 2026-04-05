import type { Post } from './post';

export interface Bookmark {
  id: string;
  postId: string;
  userId: string;
  active: boolean;
  createdAt: string;
}

export interface PaginatedBookmarks {
  items: Post[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
