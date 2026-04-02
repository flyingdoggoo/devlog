import apiClient from '@services/api';
import type { ApiResponse } from '../types/api';
import type { Tag } from '../types/tag';

export const tagsApi = {
  getAllTags: async (): Promise<Tag[]> => {
    const response = await apiClient.get<ApiResponse<Tag[]>>('/tags');
    return response.data.data;
  },
};
