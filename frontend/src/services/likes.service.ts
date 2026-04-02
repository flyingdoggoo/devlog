import apiClient from '@services/api';
import type { Like, LikeWithUser } from '../types/like';
import type { ApiResponse } from '../types/api';

export const likesApi = {
  // Like a post
  likePost: async (postId: string): Promise<Like> => {
    const response = await apiClient.post<ApiResponse<Like>>(`/posts/${postId}/likes`);
    return response.data.data;
  },

  // Unlike a post
  unlikePost: async (postId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/posts/${postId}/likes`);
  },

  // Get users who liked a post
  getLikesByPostId: async (postId: string): Promise<LikeWithUser[]> => {
    const response = await apiClient.get<ApiResponse<LikeWithUser[]>>(`/posts/${postId}/likes/users`);
    return response.data.data;
  },
};
