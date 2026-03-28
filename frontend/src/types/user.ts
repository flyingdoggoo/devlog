// User types from Prisma schema
export interface User {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Credential {
  userId: string;
  email: string;
  username: string;
  passwordHash: string;
}

export interface UserProfile extends User {
  email?: string;
  username?: string;
}
