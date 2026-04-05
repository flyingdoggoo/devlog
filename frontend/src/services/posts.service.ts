import apiClient from '@services/api';
import type { Post, CreatePostDto, UpdatePostDto } from '../types/post';
import type { ApiResponse } from '../types/api';

export interface PaginatedPosts {
  items: Post[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const postsApi = {
  getAllPost: async (page = 1, limit = 10): Promise<PaginatedPosts> => {
    const response = await apiClient.get<ApiResponse<PaginatedPosts>>('/posts', {
      params: { page, limit },
    });
    return response.data.data;
  },

  getPostBySlug: async (slug: string): Promise<ApiResponse<Post>> => {
    const response = await apiClient.get(`/posts/${slug}`);
    return response.data;
  },

  createPost: async (data: CreatePostDto): Promise<ApiResponse<Post>> => {
    const response = await apiClient.post('/posts', data);
    return response.data;
  },

  updatePost: async (id: string, data: UpdatePostDto): Promise<ApiResponse<Post>> => {
    const response = await apiClient.patch(`/posts/${id}`, data);
    return response.data;
  },

  deletePost: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await apiClient.delete(`/posts/${id}`);
    return response.data;
  },
};
