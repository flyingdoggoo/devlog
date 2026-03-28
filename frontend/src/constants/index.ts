// API Base URL
export const API_BASE_URL = '/api';

// App name
export const APP_NAME = 'DevLog';

// Cookie names
export const AUTH_COOKIE = 'Authentication';
export const REFRESH_COOKIE = 'RefreshToken';
export const SESSION_COOKIE = 'SessionId';

// Local storage keys
export const STORAGE_KEYS = {
  USER: 'devlog_user',
  THEME: 'devlog_theme',
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  POSTS: '/posts',
  POST_DETAIL: '/posts/:slug',
  CREATE_POST: '/posts/create',
  EDIT_POST: '/posts/:slug/edit',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  USERS: '/users',
  USER_PROFILE: '/users/:id',
} as const;

// Post status
export const POST_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  NEW_FOLLOWER: 'NEW_FOLLOWER',
  NEW_COMMENT: 'NEW_COMMENT',
  NEW_LIKE: 'NEW_LIKE',
} as const;
