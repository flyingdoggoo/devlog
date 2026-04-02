// User types from Prisma schema
export interface User {
  id: string;
  name: string | null;
  username: string;
  avatarUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Credential {
  userId: string;
  email: string;
  passwordHash: string;
}

