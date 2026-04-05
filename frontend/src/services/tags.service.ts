import apiClient from '@services/api';
import type { ApiResponse } from '../types/api';
import type { CreateTagDto, Tag } from '../types/tag';
import type { Post } from '../types/post';

export interface TagPostsResponse {
  tag: Tag;
  items: Post[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const tagsApi = {
  getAllTags: async (): Promise<Tag[]> => {
    const response = await apiClient.get<ApiResponse<Tag[]>>('/tags');
    return response.data.data;
  },

  getTagById: async (id: string): Promise<Tag> => {
    const response = await apiClient.get<ApiResponse<Tag>>(`/tags/${id}`);
    return response.data.data;
  },

  getPostsByTagId: async (tagId: string, page = 1, limit = 10): Promise<TagPostsResponse> => {
    const response = await apiClient.get<ApiResponse<TagPostsResponse>>(`/tags/${tagId}/posts`, {
      params: { page, limit },
    });

    return response.data.data;
  },

  createTag: async (payload: CreateTagDto): Promise<Tag> => {
    const response = await apiClient.post<ApiResponse<Tag>>('/tags', payload);
    return response.data.data;
  },
};
