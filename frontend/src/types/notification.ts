import { User } from './user';

export enum NotificationType {
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  NEW_COMMENT = 'NEW_COMMENT',
  NEW_LIKE = 'NEW_LIKE',
}

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  postId?: string | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  actor?: User;
  post?: {
    id: string;
    title: string;
    slug: string;
  };
}
