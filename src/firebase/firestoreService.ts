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
  content?: string;
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

export interface FirestoreArticle {
  id: string;
  uid: string;
  username: string;
  displayName: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  coverImage?: string;
  likes: string[];
  views: number;
  status: 'active' | 'removed';
  createdAt: string;
  updatedAt: string;
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

export interface AccessLog {
  id: string;
  uid?: string;
  email?: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAIL' | 'LOGOUT';
  ip: string;
  userAgent: string;
  success: boolean;
  reason?: string;
  timestamp: string;
}

export interface BlockedIp {
  id: string;
  ip: string;
  reason: string;
  createdAt: string;
  createdBy: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  status: 'new' | 'read' | 'resolved';
}

function getLS<T>(key: string, def: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? def;
  } catch {
    return def;
  }
}

function setLS(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

const USERS_KEY = 'pa_users';
const PROJECTS_KEY = 'pa_projects';
const BLOGS_KEY = 'pa_blogs';
const ARTICLES_KEY = 'pa_articles';
const ACCESS_LOG_KEY = 'pa_access_logs';
const BLOCKED_IPS_KEY = 'pa_blocked_ips';
const CONTACT_MESSAGES_KEY = 'pa_contact_messages';

export async function getUserProfile(uid: string): Promise<FirestoreUser | null> {
  const users: FirestoreUser[] = getLS(USERS_KEY, []);
  return users.find((u) => u.uid === uid) || null;
}

export async function getUserByUsername(username: string): Promise<FirestoreUser | null> {
  const users: FirestoreUser[] = getLS(USERS_KEY, []);
  return users.find((u) => u.username === username) || null;
}

export async function createUserProfile(profile: FirestoreUser): Promise<void> {
  const users: FirestoreUser[] = getLS(USERS_KEY, []);
  if (!users.find((u) => u.uid === profile.uid)) {
    users.push(profile);
    setLS(USERS_KEY, users);
  }
}

export async function updateUserProfile(uid: string, updates: Partial<FirestoreUser>): Promise<void> {
  const users: FirestoreUser[] = getLS(USERS_KEY, []);
  const idx = users.findIndex((u) => u.uid === uid);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates };
    setLS(USERS_KEY, users);
  }
}

export async function updateLastLogin(uid: string): Promise<void> {
  await updateUserProfile(uid, { lastLogin: new Date().toISOString() });
}

export async function getAllUsers(): Promise<FirestoreUser[]> {
  return getLS(USERS_KEY, []);
}

export async function setUserRole(uid: string, role: FirestoreUser['role']): Promise<void> {
  await updateUserProfile(uid, { role });
}

export async function setUserBan(uid: string, isBanned: boolean, banReason?: string): Promise<void> {
  await updateUserProfile(uid, {
    isBanned,
    banReason: isBanned ? banReason || 'Kural ihlali' : undefined,
  });
}

export async function addProject(project: Omit<FirestoreProject, 'id'>): Promise<string> {
  const projects: FirestoreProject[] = getLS(PROJECTS_KEY, []);
  const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  projects.unshift({ ...project, id });
  setLS(PROJECTS_KEY, projects);
  return id;
}

export async function getProjects(): Promise<FirestoreProject[]> {
  const projects: FirestoreProject[] = getLS(PROJECTS_KEY, []);
  return projects.filter((p) => p.status === 'active');
}

export async function getProjectsAdmin(): Promise<FirestoreProject[]> {
  const projects: FirestoreProject[] = getLS(PROJECTS_KEY, []);
  return projects.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function getUserProjects(uid: string): Promise<FirestoreProject[]> {
  const projects: FirestoreProject[] = getLS(PROJECTS_KEY, []);
  return projects.filter((p) => p.uid === uid);
}

export async function setProjectStatus(id: string, status: FirestoreProject['status']): Promise<void> {
  const projects: FirestoreProject[] = getLS(PROJECTS_KEY, []);
  const idx = projects.findIndex((p) => p.id === id);
  if (idx !== -1) {
    projects[idx].status = status;
    setLS(PROJECTS_KEY, projects);
  }
}

export async function deleteProject(id: string): Promise<void> {
  await setProjectStatus(id, 'removed');
}

export async function toggleProjectLike(id: string, uid: string): Promise<void> {
  const projects: FirestoreProject[] = getLS(PROJECTS_KEY, []);
  const idx = projects.findIndex((p) => p.id === id);
  if (idx !== -1) {
    const likes = projects[idx].likes || [];
    projects[idx].likes = likes.includes(uid) ? likes.filter((l) => l !== uid) : [...likes, uid];
    setLS(PROJECTS_KEY, projects);
  }
}

export async function addBlog(blog: Omit<FirestoreBlog, 'id'>): Promise<string> {
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  const id = `blog_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  blogs.unshift({ ...blog, id });
  setLS(BLOGS_KEY, blogs);
  return id;
}

export async function getBlogs(): Promise<FirestoreBlog[]> {
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  return blogs.filter((b) => b.status === 'active');
}

export async function getBlogsAdmin(): Promise<FirestoreBlog[]> {
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  return blogs.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function getUserBlogs(uid: string): Promise<FirestoreBlog[]> {
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  return blogs.filter((b) => b.uid === uid);
}

export async function getBlog(id: string): Promise<FirestoreBlog | null> {
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  return blogs.find((b) => b.id === id) || null;
}

export async function setBlogStatus(id: string, status: FirestoreBlog['status']): Promise<void> {
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  const idx = blogs.findIndex((b) => b.id === id);
  if (idx !== -1) {
    blogs[idx].status = status;
    setLS(BLOGS_KEY, blogs);
  }
}

export async function deleteBlog(id: string): Promise<void> {
  await setBlogStatus(id, 'removed');
}

export async function toggleBlogLike(id: string, uid: string): Promise<void> {
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  const idx = blogs.findIndex((b) => b.id === id);
  if (idx !== -1) {
    const likes = blogs[idx].likes || [];
    blogs[idx].likes = likes.includes(uid) ? likes.filter((l) => l !== uid) : [...likes, uid];
    setLS(BLOGS_KEY, blogs);
  }
}

export async function addArticle(article: Omit<FirestoreArticle, 'id'>): Promise<string> {
  const articles: FirestoreArticle[] = getLS(ARTICLES_KEY, []);
  const id = `article_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  articles.unshift({ ...article, id });
  setLS(ARTICLES_KEY, articles);
  return id;
}

export async function getArticles(): Promise<FirestoreArticle[]> {
  const articles: FirestoreArticle[] = getLS(ARTICLES_KEY, []);
  return articles.filter((a) => a.status === 'active');
}

export async function getArticleById(id: string): Promise<FirestoreArticle | null> {
  const articles: FirestoreArticle[] = getLS(ARTICLES_KEY, []);
  return articles.find((a) => a.id === id) || null;
}

export async function getUserArticles(uid: string): Promise<FirestoreArticle[]> {
  const articles: FirestoreArticle[] = getLS(ARTICLES_KEY, []);
  return articles.filter((a) => a.uid === uid && a.status === 'active');
}

export async function toggleArticleLike(id: string, uid: string): Promise<void> {
  const articles: FirestoreArticle[] = getLS(ARTICLES_KEY, []);
  const idx = articles.findIndex((a) => a.id === id);
  if (idx !== -1) {
    const likes = articles[idx].likes || [];
    articles[idx].likes = likes.includes(uid) ? likes.filter((l) => l !== uid) : [...likes, uid];
    setLS(ARTICLES_KEY, articles);
  }
}

export async function incrementArticleViews(id: string): Promise<void> {
  const articles: FirestoreArticle[] = getLS(ARTICLES_KEY, []);
  const idx = articles.findIndex((a) => a.id === id);
  if (idx !== -1) {
    articles[idx].views = (articles[idx].views || 0) + 1;
    setLS(ARTICLES_KEY, articles);
  }
}

export async function setArticleStatus(id: string, status: FirestoreArticle['status']): Promise<void> {
  const articles: FirestoreArticle[] = getLS(ARTICLES_KEY, []);
  const idx = articles.findIndex((a) => a.id === id);
  if (idx !== -1) {
    articles[idx].status = status;
    articles[idx].updatedAt = new Date().toISOString();
    setLS(ARTICLES_KEY, articles);
  }
}

export async function incrementBlogViews(id: string): Promise<void> {
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  const idx = blogs.findIndex((b) => b.id === id);
  if (idx !== -1) {
    blogs[idx].views = (blogs[idx].views || 0) + 1;
    setLS(BLOGS_KEY, blogs);
  }
}

export async function addAccessLog(log: Omit<AccessLog, 'id' | 'timestamp'>): Promise<void> {
  const logs: AccessLog[] = getLS(ACCESS_LOG_KEY, []);
  logs.unshift({
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  });
  if (logs.length > 1000) logs.splice(1000);
  setLS(ACCESS_LOG_KEY, logs);
}

export async function getAccessLogs(): Promise<AccessLog[]> {
  return getLS(ACCESS_LOG_KEY, []);
}

export async function getBlockedIps(): Promise<BlockedIp[]> {
  return getLS(BLOCKED_IPS_KEY, []);
}

export async function isIpBlocked(ip: string): Promise<BlockedIp | null> {
  const blockedIps = getLS<BlockedIp[]>(BLOCKED_IPS_KEY, []);
  return blockedIps.find((entry) => entry.ip === ip) || null;
}

export async function blockIp(ip: string, reason: string, createdBy: string): Promise<void> {
  const blockedIps = getLS<BlockedIp[]>(BLOCKED_IPS_KEY, []);
  if (!blockedIps.find((entry) => entry.ip === ip)) {
    blockedIps.unshift({
      id: `ip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ip,
      reason,
      createdBy,
      createdAt: new Date().toISOString(),
    });
    setLS(BLOCKED_IPS_KEY, blockedIps);
  }
}

export async function unblockIp(ip: string): Promise<void> {
  const blockedIps = getLS<BlockedIp[]>(BLOCKED_IPS_KEY, []);
  setLS(
    BLOCKED_IPS_KEY,
    blockedIps.filter((entry) => entry.ip !== ip)
  );
}

export async function addContactMessage(
  payload: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>
): Promise<void> {
  const messages = getLS<ContactMessage[]>(CONTACT_MESSAGES_KEY, []);
  messages.unshift({
    ...payload,
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'new',
  });
  setLS(CONTACT_MESSAGES_KEY, messages);
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  return getLS<ContactMessage[]>(CONTACT_MESSAGES_KEY, []).sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
}

export async function setContactMessageStatus(
  id: string,
  status: ContactMessage['status']
): Promise<void> {
  const messages = getLS<ContactMessage[]>(CONTACT_MESSAGES_KEY, []);
  const next = messages.map((msg) => (msg.id === id ? { ...msg, status } : msg));
  setLS(CONTACT_MESSAGES_KEY, next);
}

export async function addLog(_log: { action: string; uid?: string; details?: string; success: boolean }): Promise<void> {
  // compatibility placeholder
}