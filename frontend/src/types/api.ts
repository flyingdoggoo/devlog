// API Response types
export interface ApiResponse<T = any> {
  ok: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  ok: boolean;
  message: string;
  path: string;
  timestamp: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
