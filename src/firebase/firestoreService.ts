import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';

// ─── Tipler ─────────────────────────────────────────────────────────────────────
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
  documents?: ProjectDocument[];
  likes: string[];
  status: 'active' | 'removed';
  createdAt: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
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

export interface RbgLinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  iconUrl?: string;
}

export interface RbgPageData {
  ownerUid?: string;
  ownerUsername?: string;
  title: string;
  subtitle: string;
  avatarUrl: string;
  backgroundImage: string;
  links: RbgLinkItem[];
  updatedAt: string;
}

// ─── LocalStorage fallback ──────────────────────────────────────────────────────
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
const RBG_PAGE_KEY = 'pa_rbg_page';

const canUseRemote = isFirebaseConfigured && !!db;

// ─── Kullanıcılar ──────────────────────────────────────────────────────────────
export async function getUserProfile(uid: string): Promise<FirestoreUser | null> {
  if (canUseRemote && db) {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as FirestoreUser) : null;
  }
  const users: FirestoreUser[] = getLS(USERS_KEY, []);
  return users.find((u) => u.uid === uid) || null;
}

export async function getUserByUsername(username: string): Promise<FirestoreUser | null> {
  if (canUseRemote && db) {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as FirestoreUser;
  }
  const users: FirestoreUser[] = getLS(USERS_KEY, []);
  return users.find((u) => u.username === username) || null;
}

export async function createUserProfile(profile: FirestoreUser): Promise<void> {
  if (canUseRemote && db) {
    await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
    return;
  }
  const users: FirestoreUser[] = getLS(USERS_KEY, []);
  if (!users.find((u) => u.uid === profile.uid)) {
    users.push(profile);
    setLS(USERS_KEY, users);
  }
}

export async function updateUserProfile(uid: string, updates: Partial<FirestoreUser>): Promise<void> {
  if (canUseRemote && db) {
    await updateDoc(doc(db, 'users', uid), updates as Partial<FirestoreUser>);
    return;
  }
  const users: FirestoreUser[] = getLS(USERS_KEY, []);
  const idx = users.findIndex((u) => u.uid === uid);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates };
    setLS(USERS_KEY, users);
  }
}

export async function updateLastLogin(uid: string): Promise<void> {
  const now = new Date().toISOString();
  await updateUserProfile(uid, { lastLogin: now });
}

export async function getAllUsers(): Promise<FirestoreUser[]> {
  if (canUseRemote && db) {
    const snap = await getDocs(collection(db, 'users'));
    const users = snap.docs.map((d) => d.data() as FirestoreUser);
    return users.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
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

// ─── Projeler ──────────────────────────────────────────────────────────────────
export async function addProject(project: Omit<FirestoreProject, 'id'>): Promise<string> {
  if (canUseRemote && db) {
    const ref = await addDoc(collection(db, 'projects'), project);
    await updateDoc(ref, { id: ref.id });
    return ref.id;
  }
  const projects: FirestoreProject[] = getLS(PROJECTS_KEY, []);
  const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  projects.unshift({ ...project, id });
  setLS(PROJECTS_KEY, projects);
  return id;
}

export async function getProjects(): Promise<FirestoreProject[]> {
  if (canUseRemote && db) {
    const snap = await getDocs(collection(db, 'projects'));
    const items = snap.docs.map((d) => d.data() as FirestoreProject);
    return items.filter((p) => p.status === 'active').sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  const projects: FirestoreProject[] = getLS(PROJECTS_KEY, []);
  return projects.filter((p) => p.status === 'active');
}

export async function getProjectsAdmin(): Promise<FirestoreProject[]> {
  if (canUseRemote && db) {
    const snap = await getDocs(collection(db, 'projects'));
    const items = snap.docs.map((d) => d.data() as FirestoreProject);
    return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  const projects: FirestoreProject[] = getLS(PROJECTS_KEY, []);
  return projects.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function getUserProjects(uid: string): Promise<FirestoreProject[]> {
  if (canUseRemote && db) {
    const q = query(collection(db, 'projects'), where('uid', '==', uid));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => d.data() as FirestoreProject);
    return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  const projects: FirestoreProject[] = getLS(PROJECTS_KEY, []);
  return projects.filter((p) => p.uid === uid);
}

export async function setProjectStatus(id: string, status: FirestoreProject['status']): Promise<void> {
  if (canUseRemote && db) {
    await updateDoc(doc(db, 'projects', id), { status });
    return;
  }
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
  if (canUseRemote && db) {
    const ref = doc(db, 'projects', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as FirestoreProject;
    const likes = data.likes || [];
    const nextLikes = likes.includes(uid) ? likes.filter((l) => l !== uid) : [...likes, uid];
    await updateDoc(ref, { likes: nextLikes });
    return;
  }
  const projects: FirestoreProject[] = getLS(PROJECTS_KEY, []);
  const idx = projects.findIndex((p) => p.id === id);
  if (idx !== -1) {
    const likes = projects[idx].likes || [];
    projects[idx].likes = likes.includes(uid) ? likes.filter((l) => l !== uid) : [...likes, uid];
    setLS(PROJECTS_KEY, projects);
  }
}

// ─── Bloglar ───────────────────────────────────────────────────────────────────
export async function addBlog(blog: Omit<FirestoreBlog, 'id'>): Promise<string> {
  if (canUseRemote && db) {
    const ref = await addDoc(collection(db, 'blogs'), blog);
    await updateDoc(ref, { id: ref.id });
    return ref.id;
  }
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  const id = `blog_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  blogs.unshift({ ...blog, id });
  setLS(BLOGS_KEY, blogs);
  return id;
}

export async function getBlogs(): Promise<FirestoreBlog[]> {
  if (canUseRemote && db) {
    const snap = await getDocs(collection(db, 'blogs'));
    const items = snap.docs.map((d) => d.data() as FirestoreBlog);
    return items.filter((b) => b.status === 'active').sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  return blogs.filter((b) => b.status === 'active');
}

export async function getBlogsAdmin(): Promise<FirestoreBlog[]> {
  if (canUseRemote && db) {
    const snap = await getDocs(collection(db, 'blogs'));
    const items = snap.docs.map((d) => d.data() as FirestoreBlog);
    return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  return blogs.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function getUserBlogs(uid: string): Promise<FirestoreBlog[]> {
  if (canUseRemote && db) {
    const q = query(collection(db, 'blogs'), where('uid', '==', uid));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => d.data() as FirestoreBlog);
    return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  return blogs.filter((b) => b.uid === uid);
}

export async function getBlog(id: string): Promise<FirestoreBlog | null> {
  if (canUseRemote && db) {
    const snap = await getDoc(doc(db, 'blogs', id));
    return snap.exists() ? (snap.data() as FirestoreBlog) : null;
  }
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  return blogs.find((b) => b.id === id) || null;
}

export async function setBlogStatus(id: string, status: FirestoreBlog['status']): Promise<void> {
  if (canUseRemote && db) {
    await updateDoc(doc(db, 'blogs', id), { status });
    return;
  }
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
  if (canUseRemote && db) {
    const ref = doc(db, 'blogs', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as FirestoreBlog;
    const likes = data.likes || [];
    const nextLikes = likes.includes(uid) ? likes.filter((l) => l !== uid) : [...likes, uid];
    await updateDoc(ref, { likes: nextLikes });
    return;
  }
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  const idx = blogs.findIndex((b) => b.id === id);
  if (idx !== -1) {
    const likes = blogs[idx].likes || [];
    blogs[idx].likes = likes.includes(uid) ? likes.filter((l) => l !== uid) : [...likes, uid];
    setLS(BLOGS_KEY, blogs);
  }
}

export async function incrementBlogViews(id: string): Promise<void> {
  if (canUseRemote && db) {
    const ref = doc(db, 'blogs', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as FirestoreBlog;
    const views = data.views || 0;
    await updateDoc(ref, { views: views + 1 });
    return;
  }
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  const idx = blogs.findIndex((b) => b.id === id);
  if (idx !== -1) {
    blogs[idx].views = (blogs[idx].views || 0) + 1;
    setLS(BLOGS_KEY, blogs);
  }
}

// ─── Makaleler (Wiki) ──────────────────────────────────────────────────────────
export async function addArticle(article: Omit<FirestoreArticle, 'id'>): Promise<string> {
  if (canUseRemote && db) {
    const ref = await addDoc(collection(db, 'articles'), article);
    await updateDoc(ref, { id: ref.id });
    return ref.id;
  }
  const articles: FirestoreArticle[] = getLS(ARTICLES_KEY, []);
  const id = `article_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  articles.unshift({ ...article, id });
  setLS(ARTICLES_KEY, articles);
  return id;
}

export async function getArticles(): Promise<FirestoreArticle[]> {
  if (canUseRemote && db) {
    const snap = await getDocs(collection(db, 'articles'));
    const items = snap.docs.map((d) => d.data() as FirestoreArticle);
    return items.filter((a) => a.status === 'active').sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  const articles: FirestoreArticle[] = getLS(ARTICLES_KEY, []);
  return articles.filter((a) => a.status === 'active');
}

export async function getArticleById(id: string): Promise<FirestoreArticle | null> {
  if (canUseRemote && db) {
    const snap = await getDoc(doc(db, 'articles', id));
    return snap.exists() ? (snap.data() as FirestoreArticle) : null;
  }
  const articles: FirestoreArticle[] = getLS(ARTICLES_KEY, []);
  return articles.find((a) => a.id === id) || null;
}

export async function getUserArticles(uid: string): Promise<FirestoreArticle[]> {
  if (canUseRemote && db) {
    const q = query(collection(db, 'articles'), where('uid', '==', uid));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => d.data() as FirestoreArticle);
    return items.filter((a) => a.status === 'active').sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  const articles: FirestoreArticle[] = getLS(ARTICLES_KEY, []);
  return articles.filter((a) => a.uid === uid && a.status === 'active');
}

export async function toggleArticleLike(id: string, uid: string): Promise<void> {
  if (canUseRemote && db) {
    const ref = doc(db, 'articles', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as FirestoreArticle;
    const likes = data.likes || [];
    const nextLikes = likes.includes(uid) ? likes.filter((l) => l !== uid) : [...likes, uid];
    await updateDoc(ref, { likes: nextLikes });
    return;
  }
  const articles: FirestoreArticle[] = getLS(ARTICLES_KEY, []);
  const idx = articles.findIndex((a) => a.id === id);
  if (idx !== -1) {
    const likes = articles[idx].likes || [];
    articles[idx].likes = likes.includes(uid) ? likes.filter((l) => l !== uid) : [...likes, uid];
    setLS(ARTICLES_KEY, articles);
  }
}

export async function incrementArticleViews(id: string): Promise<void> {
  if (canUseRemote && db) {
    const ref = doc(db, 'articles', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as FirestoreArticle;
    const views = data.views || 0;
    await updateDoc(ref, { views: views + 1 });
    return;
  }
  const articles: FirestoreArticle[] = getLS(ARTICLES_KEY, []);
  const idx = articles.findIndex((a) => a.id === id);
  if (idx !== -1) {
    articles[idx].views = (articles[idx].views || 0) + 1;
    setLS(ARTICLES_KEY, articles);
  }
}

export async function setArticleStatus(id: string, status: FirestoreArticle['status']): Promise<void> {
  if (canUseRemote && db) {
    await updateDoc(doc(db, 'articles', id), { status, updatedAt: new Date().toISOString() });
    return;
  }
  const articles: FirestoreArticle[] = getLS(ARTICLES_KEY, []);
  const idx = articles.findIndex((a) => a.id === id);
  if (idx !== -1) {
    articles[idx].status = status;
    articles[idx].updatedAt = new Date().toISOString();
    setLS(ARTICLES_KEY, articles);
  }
}

// ─── Güvenlik ve loglar ────────────────────────────────────────────────────────
export async function addAccessLog(log: Omit<AccessLog, 'id' | 'timestamp'>): Promise<void> {
  const entry: AccessLog = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  if (canUseRemote && db) {
    await addDoc(collection(db, 'accessLogs'), entry);
    return;
  }
  const logs: AccessLog[] = getLS(ACCESS_LOG_KEY, []);
  logs.unshift(entry);
  if (logs.length > 1000) logs.splice(1000);
  setLS(ACCESS_LOG_KEY, logs);
}

export async function getAccessLogs(): Promise<AccessLog[]> {
  if (canUseRemote && db) {
    const snap = await getDocs(collection(db, 'accessLogs'));
    const items = snap.docs.map((d) => d.data() as AccessLog);
    return items.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  }
  return getLS(ACCESS_LOG_KEY, []);
}

export async function getBlockedIps(): Promise<BlockedIp[]> {
  if (canUseRemote && db) {
    const snap = await getDocs(collection(db, 'blockedIps'));
    const items = snap.docs.map((d) => d.data() as BlockedIp);
    return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  return getLS<BlockedIp[]>(BLOCKED_IPS_KEY, []);
}

export async function isIpBlocked(ip: string): Promise<BlockedIp | null> {
  if (canUseRemote && db) {
    const q = query(collection(db, 'blockedIps'), where('ip', '==', ip));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as BlockedIp;
  }
  const blockedIps = getLS<BlockedIp[]>(BLOCKED_IPS_KEY, []);
  return blockedIps.find((entry) => entry.ip === ip) || null;
}

export async function blockIp(ip: string, reason: string, createdBy: string): Promise<void> {
  if (canUseRemote && db) {
    const entry: BlockedIp = {
      id: `ip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ip,
      reason,
      createdBy,
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, 'blockedIps'), entry);
    return;
  }
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
  if (canUseRemote && db) {
    const q = query(collection(db, 'blockedIps'), where('ip', '==', ip));
    const snap = await getDocs(q);
    const batch = snap.docs;
    await Promise.all(batch.map((d) => updateDoc(doc(db!, 'blockedIps', d.id), { reason: 'unblocked' })));
    return;
  }
  const blockedIps = getLS<BlockedIp[]>(BLOCKED_IPS_KEY, []);
  setLS(BLOCKED_IPS_KEY, blockedIps.filter((entry) => entry.ip !== ip));
}

// ─── İletişim mesajları ────────────────────────────────────────────────────────
export async function addContactMessage(
  payload: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>
): Promise<void> {
  const entry: ContactMessage = {
    ...payload,
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'new',
  };
  if (canUseRemote && db) {
    await addDoc(collection(db, 'contactMessages'), entry);
    return;
  }
  const messages = getLS<ContactMessage[]>(CONTACT_MESSAGES_KEY, []);
  messages.unshift(entry);
  setLS(CONTACT_MESSAGES_KEY, messages);
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  if (canUseRemote && db) {
    const snap = await getDocs(collection(db, 'contactMessages'));
    const items = snap.docs.map((d) => d.data() as ContactMessage);
    return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  return getLS<ContactMessage[]>(CONTACT_MESSAGES_KEY, []).sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
}

export async function setContactMessageStatus(
  id: string,
  status: ContactMessage['status']
): Promise<void> {
  if (canUseRemote && db) {
    const q = query(collection(db, 'contactMessages'), where('id', '==', id));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => updateDoc(doc(db!, 'contactMessages', d.id), { status })));
    return;
  }
  const messages = getLS<ContactMessage[]>(CONTACT_MESSAGES_KEY, []);
  const next = messages.map((msg) => (msg.id === id ? { ...msg, status } : msg));
  setLS(CONTACT_MESSAGES_KEY, next);
}

// ─── RBG özel sayfası ──────────────────────────────────────────────────────────
const DEFAULT_RBG: RbgPageData = {
  title: 'RBG',
  subtitle: 'Kisisel baglantilarim ve ozel sayfam.',
  avatarUrl: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png',
  backgroundImage:
    'https://images.unsplash.com/photo-1618331833071-ce81bd50d300?auto=format&fit=crop&w=1600&q=80',
  links: [],
  updatedAt: new Date().toISOString(),
};

export async function getRbgPageData(): Promise<RbgPageData> {
  if (canUseRemote && db) {
    const ref = doc(db!, 'rbgPages', 'main');
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, DEFAULT_RBG);
      return DEFAULT_RBG;
    }
    return snap.data() as RbgPageData;
  }
  return getLS<RbgPageData>(RBG_PAGE_KEY, DEFAULT_RBG);
}

export async function updateRbgPageData(updates: Partial<RbgPageData>): Promise<RbgPageData> {
  if (canUseRemote && db) {
    const current = await getRbgPageData();
    const next: RbgPageData = {
      ...current,
      ...updates,
      links: updates.links ?? current.links,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db!, 'rbgPages', 'main'), next, { merge: true });
    return next;
  }
  const current = await getRbgPageData();
  const next: RbgPageData = {
    ...current,
    ...updates,
    links: updates.links ?? current.links,
    updatedAt: new Date().toISOString(),
  };
  setLS(RBG_PAGE_KEY, next);
  return next;
}

// Eski isimle çağrılan boş fonksiyon için uyumluluk
export async function addLog(_log: { action: string; uid?: string; details?: string; success: boolean }): Promise<void> {
  // Firestore'a aktarılmıyor, sadece geriye dönük uyumluluk için bırakıldı.
}
