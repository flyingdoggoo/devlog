import apiClient from '@services/api';
import type { ApiResponse } from '../types/api';

export type SearchType = 'posts' | 'users' | 'tags';

export interface SearchParams {
  q: string;
  type?: SearchType;
  filters?: string;
  page?: number;
  limit?: number;
}

export interface SearchPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: string;
  rank: number;
  author: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

export interface SearchUserItem {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  rank: number;
  _count: {
    followers: number;
    posts: number;
  };
}

export interface SearchTagItem {
  id: string;
  name: string;
  rank: number;
  postCount: number;
}

export type SearchItem = SearchPostItem | SearchUserItem | SearchTagItem;

export interface SearchResponse<T = SearchItem> {
  q: string;
  type: SearchType;
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  tookMs: number;
  items: T[];
}

export const searchApi = {
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const response = await apiClient.get<ApiResponse<SearchResponse>>('/search', { params });
    return response.data.data;
  },
};
