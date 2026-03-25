// Firestore service - localStorage fallback included
// This file exports the same interface whether Firebase is configured or not

export interface FirestoreUser {
  uid: string;
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  role: 'user' | 'moderator' | 'admin';
  skills?: string[];
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  createdAt: string;
  lastLogin?: string;
  isBanned?: boolean;
  banReason?: string;
  projectCount?: number;
  blogCount?: number;
}

export interface FirestoreProject {
  id: string;
  uid: string;
  username: string;
  displayName: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  tags: string[];
  github?: string;
  demo?: string;
  image?: string;
  likes: string[];
  status: 'active' | 'removed';
  createdAt: string;
}

export interface FirestoreBlog {
  id: string;
  uid: string;
  username: string;
  displayName: string;
  title: string;
  content: string;
  summary: string;
  coverImage?: string;
  tags: string[];
  likes: string[];
  views: number;
  status: 'active' | 'removed';
  createdAt: string;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
function getLS<T>(key: string, def: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? def; } catch { return def; }
}
function setLS(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

export async function getUserProfile(uid: string): Promise<FirestoreUser | null> {
  const users: FirestoreUser[] = getLS('pa_users', []);
  return users.find(u => u.uid === uid) || null;
}

export async function getUserByUsername(username: string): Promise<FirestoreUser | null> {
  const users: FirestoreUser[] = getLS('pa_users', []);
  return users.find(u => u.username === username) || null;
}

export async function createUserProfile(profile: FirestoreUser): Promise<void> {
  const users: FirestoreUser[] = getLS('pa_users', []);
  if (!users.find(u => u.uid === profile.uid)) {
    users.push(profile);
    setLS('pa_users', users);
  }
}

export async function updateUserProfile(uid: string, updates: Partial<FirestoreUser>): Promise<void> {
  const users: FirestoreUser[] = getLS('pa_users', []);
  const idx = users.findIndex(u => u.uid === uid);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates };
    setLS('pa_users', users);
  }
}

export async function updateLastLogin(uid: string): Promise<void> {
  await updateUserProfile(uid, { lastLogin: new Date().toISOString() });
}

export async function getAllUsers(): Promise<FirestoreUser[]> {
  return getLS('pa_users', []);
}

export async function addLog(_log: { action: string; uid?: string; details?: string; success: boolean }): Promise<void> {
  // no-op in localStorage mode
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export async function addProject(project: Omit<FirestoreProject, 'id'>): Promise<string> {
  const projects: FirestoreProject[] = getLS('pa_projects', []);
  const id = 'proj_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  projects.unshift({ ...project, id });
  setLS('pa_projects', projects);
  return id;
}

export async function getProjects(): Promise<FirestoreProject[]> {
  const projects: FirestoreProject[] = getLS('pa_projects', []);
  return projects.filter(p => p.status === 'active');
}

export async function getUserProjects(uid: string): Promise<FirestoreProject[]> {
  const projects: FirestoreProject[] = getLS('pa_projects', []);
  return projects.filter(p => p.uid === uid);
}

export async function deleteProject(id: string): Promise<void> {
  const projects: FirestoreProject[] = getLS('pa_projects', []);
  const idx = projects.findIndex(p => p.id === id);
  if (idx !== -1) { projects[idx].status = 'removed'; setLS('pa_projects', projects); }
}

export async function toggleProjectLike(id: string, uid: string): Promise<void> {
  const projects: FirestoreProject[] = getLS('pa_projects', []);
  const idx = projects.findIndex(p => p.id === id);
  if (idx !== -1) {
    const likes = projects[idx].likes || [];
    if (likes.includes(uid)) projects[idx].likes = likes.filter(l => l !== uid);
    else projects[idx].likes = [...likes, uid];
    setLS('pa_projects', projects);
  }
}

// ─── Blogs ────────────────────────────────────────────────────────────────────
export async function addBlog(blog: Omit<FirestoreBlog, 'id'>): Promise<string> {
  const blogs: FirestoreBlog[] = getLS('pa_blogs', []);
  const id = 'blog_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  blogs.unshift({ ...blog, id });
  setLS('pa_blogs', blogs);
  return id;
}

export async function getBlogs(): Promise<FirestoreBlog[]> {
  const blogs: FirestoreBlog[] = getLS('pa_blogs', []);
  return blogs.filter(b => b.status === 'active');
}

export async function getUserBlogs(uid: string): Promise<FirestoreBlog[]> {
  const blogs: FirestoreBlog[] = getLS('pa_blogs', []);
  return blogs.filter(b => b.uid === uid);
}

export async function getBlog(id: string): Promise<FirestoreBlog | null> {
  const blogs: FirestoreBlog[] = getLS('pa_blogs', []);
  return blogs.find(b => b.id === id) || null;
}

export async function deleteBlog(id: string): Promise<void> {
  const blogs: FirestoreBlog[] = getLS('pa_blogs', []);
  const idx = blogs.findIndex(b => b.id === id);
  if (idx !== -1) { blogs[idx].status = 'removed'; setLS('pa_blogs', blogs); }
}

export async function toggleBlogLike(id: string, uid: string): Promise<void> {
  const blogs: FirestoreBlog[] = getLS('pa_blogs', []);
  const idx = blogs.findIndex(b => b.id === id);
  if (idx !== -1) {
    const likes = blogs[idx].likes || [];
    if (likes.includes(uid)) blogs[idx].likes = likes.filter(l => l !== uid);
    else blogs[idx].likes = [...likes, uid];
    setLS('pa_blogs', blogs);
  }
}

export async function incrementBlogViews(id: string): Promise<void> {
  const blogs: FirestoreBlog[] = getLS('pa_blogs', []);
  const idx = blogs.findIndex(b => b.id === id);
  if (idx !== -1) { blogs[idx].views = (blogs[idx].views || 0) + 1; setLS('pa_blogs', blogs); }
}
