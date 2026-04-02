import { User } from './user';

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Post {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  status: PostStatus;
  viewCount: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: User;
  isLikedByMe? : boolean;
  comments?: {
    id: string;
    content: string;
    createdAt: string;
    author?: {
      id: string;
      name: string | null;
      username: string;
      avatarUrl?: string | null;
    };
  }[];
  tags?: PostTag[];
  _count?: {
    likes: number;
    comments: number;
  };
}

export interface PostTag {
  postId: string;
  tagId: string;
  tag?: Tag;
}

export interface Tag {
  id: string;
  name: string;
}

export interface CreatePostDto {
  title: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  tagIds?: string[];
  status?: PostStatus;
  publishedAt?: string;

}

export interface UpdatePostDto extends Partial<CreatePostDto> { }
