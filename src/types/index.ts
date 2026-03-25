export type UserRole = 'user' | 'admin' | 'moderator';
export type UserStatus = 'active' | 'banned' | 'suspended';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // hashed
  displayName: string;
  bio: string;
  avatar: string;
  skills: string[];
  github?: string;
  twitter?: string;
  website?: string;
  createdAt: string;
  role: UserRole;
  status: UserStatus;
  banReason?: string;
  lastLogin?: string;
  sessionToken?: string;
  loginAttempts?: number;
  twoFactorEnabled?: boolean;
}

export interface UserProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'egitim' | 'kodlama' | 'akademi' | 'tasarim';
  tags: string[];
  image: string;
  difficulty: 'Başlangıç' | 'Orta' | 'İleri';
  duration: string;
  github?: string;
  demo?: string;
  createdAt: string;
  likes: number;
  status: 'active' | 'hidden' | 'removed';
  reportCount?: number;
}

export interface BlogPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  views: number;
  status: 'active' | 'hidden' | 'removed';
  reportCount?: number;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'project' | 'blog' | 'user';
  targetId: string;
  reason: string;
  details: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalProjects: number;
  totalBlogs: number;
  totalReports: number;
  newUsersToday: number;
  newProjectsToday: number;
}
