import apiClient from '@services/api';
import type { ApiResponse } from '../types/api';
import type { Follow, CreateFollowDto } from '../types/follow';

export const followsApi = {
  followUser: async (toUserId: string): Promise<Follow> => {
    const payload: CreateFollowDto = { toUserId };
    const response = await apiClient.post<ApiResponse<Follow>>('/follows', payload);
    return response.data.data;
  },

  unfollowUser: async (followingId: string): Promise<Follow> => {
    const response = await apiClient.delete<ApiResponse<Follow>>(`/follows/${followingId}`);
    return response.data.data;
  },

  getMyFollowers: async (): Promise<Follow[]> => {
    const response = await apiClient.get<ApiResponse<Follow[]>>('/follows/followers');
    return response.data.data;
  },

  getMyFollowing: async (): Promise<Follow[]> => {
    const response = await apiClient.get<ApiResponse<Follow[]>>('/follows/following');
    return response.data.data;
  },

  getUserFollowers: async (userId: string): Promise<Follow[]> => {
    const response = await apiClient.get<ApiResponse<Follow[]>>(`/follows/users/${userId}/followers`);
    return response.data.data;
  },

  getUserFollowing: async (userId: string): Promise<Follow[]> => {
    const response = await apiClient.get<ApiResponse<Follow[]>>(`/follows/users/${userId}/following`);
    return response.data.data;
  },
};
