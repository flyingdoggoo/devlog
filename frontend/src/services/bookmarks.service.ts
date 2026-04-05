import apiClient from '@services/api';
import type { ApiResponse } from '../types/api';
import type { Bookmark, PaginatedBookmarks } from '../types/bookmark';

export const bookmarksApi = {
  bookmarkPost: async (postId: string): Promise<Bookmark> => {
    const response = await apiClient.post<ApiResponse<Bookmark>>(`/posts/${postId}/bookmarks`);
    return response.data.data;
  },

  unbookmarkPost: async (postId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/posts/${postId}/bookmarks`);
  },

  getMyBookmarks: async (page = 1, limit = 10): Promise<PaginatedBookmarks> => {
    const response = await apiClient.get<ApiResponse<PaginatedBookmarks>>('/bookmarks/me', {
      params: { page, limit },
    });
    return response.data.data;
  },
};
