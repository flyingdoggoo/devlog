import apiClient from '@services/api';
import type { ApiResponse } from '../types/api';
import type { User } from '../types/user';

export interface ProfilePost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  createdAt: string;
  _count: {
    likes: number;
    comments: number;
  };
  tags: Array<{
    tag: {
      name: string;
    };
  }>;
}

export interface UserProfile {
  id: string;
  name: string | null;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
  _count: {
    followers: number;
    following: number;
    posts: number;
    comments: number;
  };
  posts: ProfilePost[];
  credentials?: Array<{
    email?: string;
  }>;
}

export const usersApi = {
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/users/me');
    return response.data.data;
  },

  getProfileByUsername: async (username: string): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>(`/users/username/${username}`);
    return response.data.data;
  },

  updateMyUsername: async (username: string): Promise<{ id: string; username: string; name: string | null; avatarUrl: string | null }> => {
    const response = await apiClient.patch<
      ApiResponse<{ id: string; username: string; name: string | null; avatarUrl: string | null }>
    >('/users/me/username', { username });
    return response.data.data;
  },

  updateMyPassword: async (payload: { currentPassword?: string; newPassword: string; confirmPassword: string }) => {
    const response = await apiClient.patch<ApiResponse<{ success: boolean }>>('/users/me/password', payload);
    return response.data.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>('/users');
    return response.data.data;
  },
};
