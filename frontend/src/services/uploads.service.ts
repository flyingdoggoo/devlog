import apiClient from '@services/api';
import type { ApiResponse } from '../types/api';

export interface UploadedImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export const uploadsApi = {
  uploadImage: async (file: File): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<UploadedImage>>('/uploads/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },
};
