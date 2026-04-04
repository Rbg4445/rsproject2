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
  deleteDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { deleteFileFromStorage } from '../lib/storageService';

// ─── Tipler ─────────────────────────────────────────────────────────────────────
export interface Bookmark {
  refType: 'project' | 'blog' | 'article';
  refId: string;
  savedAt: string;
}

export interface DevlogEntry {
  id: string;
  version: string;
  content: string;
  createdAt: string;
}

export interface Appeal {
  id: string;
  uid: string;
  refType: 'project' | 'blog' | 'article';
  refId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

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
  lastProfileUpdateAt?: string; // profil en son ne zaman guncellendi
  followers?: string[];
  following?: string[];
  bookmarks?: Bookmark[];
  badges?: string[];
  xp?: number;
  level?: string;
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
  videoUrl?: string;
  documents?: ProjectDocument[];
  likes: string[];
  status: 'pending' | 'active' | 'removed';
  createdAt: string;
  collaborators?: string[];
  devlogs?: DevlogEntry[];
  feedbackRequested?: boolean;
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
  status: 'pending' | 'active' | 'removed';
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
  status: 'pending' | 'active' | 'removed';
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

export interface Comment {
  id: string;
  refType: 'project' | 'blog' | 'article';
  refId: string;
  uid: string;
  username: string;
  content: string;
  createdAt: string;
  status: 'pending' | 'active' | 'hidden';
}

export interface Notification {
  id: string;
  uid: string; // bildirimin hedef kullanıcısı
  type: 'approve' | 'reject' | 'comment' | 'like';
  refType: 'project' | 'blog' | 'article';
  refId: string;
  message: string;
  createdAt: string;
  read: boolean;
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

/**
 * Kullanıcı adının başkası tarafından alınıp alınmadığını kontrol eder.
 * excludeUid: güncelleme sırasında mevcut kullanıcının kendi adına şikayet etmemesi için.
 */
export async function isUsernameTaken(username: string, excludeUid?: string): Promise<boolean> {
  const normalized = username.toLowerCase().trim();
  if (canUseRemote && db) {
    const q = query(collection(db, 'users'), where('username', '==', normalized));
    const snap = await getDocs(q);
    if (snap.empty) return false;
    // Eğer bulunan tek kullanıcı excludeUid ise, bu kendi adı — sorun yok
    return snap.docs.some((d) => d.data().uid !== excludeUid);
  }
  const users: FirestoreUser[] = getLS(USERS_KEY, []);
  return users.some((u) => u.username.toLowerCase() === normalized && u.uid !== excludeUid);
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

export async function getOnlineUserCount(): Promise<number> {
  if (canUseRemote && db) {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const q = query(collection(db, 'users'), where('lastLogin', '>=', fifteenMinsAgo));
    const snap = await getDocs(q);
    return snap.size;
  }
  const users: FirestoreUser[] = getLS(USERS_KEY, []);
  if (users.length === 0) return 0;
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
  return users.filter(u => u.lastLogin && new Date(u.lastLogin) >= fifteenMinsAgo).length;
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
  if (status === 'removed') {
    await deleteProject(id);
    return;
  }
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
  if (canUseRemote && db) {
    const ref = doc(db, 'projects', id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as FirestoreProject;
      
      // 1. Supabase belgelerini sil
      if (data.documents) {
        for (const d of data.documents) {
          if (d.dataUrl) await deleteFileFromStorage(d.dataUrl);
        }
      }
      // 2. Kapak resmini sil (Eğer Supabase ise)
      if (data.image) await deleteFileFromStorage(data.image);

      // 3. Firestore dokümanını tamamen sil
      await deleteDoc(ref);
    }
    return;
  }
  const projects: FirestoreProject[] = getLS(PROJECTS_KEY, []);
  setLS(PROJECTS_KEY, projects.filter((p) => p.id !== id));
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
  if (status === 'removed') {
    await deleteBlog(id);
    return;
  }
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
  if (canUseRemote && db) {
    const ref = doc(db, 'blogs', id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as FirestoreBlog;
      // Kapak resmini sil
      if (data.coverImage) await deleteFileFromStorage(data.coverImage);
      // Dokümanı sil
      await deleteDoc(ref);
    }
    return;
  }
  const blogs: FirestoreBlog[] = getLS(BLOGS_KEY, []);
  setLS(BLOGS_KEY, blogs.filter((b) => b.id !== id));
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
  if (status === 'removed') {
    await deleteArticle(id);
    return;
  }
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

export async function deleteArticle(id: string): Promise<void> {
  if (canUseRemote && db) {
    const ref = doc(db, 'articles', id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as FirestoreArticle;
      if (data.coverImage) await deleteFileFromStorage(data.coverImage);
      await deleteDoc(ref);
    }
    return;
  }
  const articles: FirestoreArticle[] = getLS(ARTICLES_KEY, []);
  setLS(ARTICLES_KEY, articles.filter((a) => a.id !== id));
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

// ─── Yorumlar ───────────────────────────────────────────────────────────────────

export async function addComment(
  payload: Omit<Comment, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  const entry: Comment = {
    ...payload,
    id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  if (canUseRemote && db) {
    const ref = await addDoc(collection(db, 'comments'), entry);
    await updateDoc(ref, { id: entry.id }); // kendi id'mizi koruyoruz
    return entry.id;
  }

  const comments = getLS<Comment[]>('pa_comments', []);
  comments.unshift(entry);
  setLS('pa_comments', comments);
  return entry.id;
}

export async function getCommentsForRef(
  refType: Comment['refType'],
  refId: string,
  includePending = false
): Promise<Comment[]> {
  if (canUseRemote && db) {
    let qRef = query(
      collection(db, 'comments'),
      where('refType', '==', refType),
      where('refId', '==', refId)
    );
    const snap = await getDocs(qRef);
    let items = snap.docs.map((d) => d.data() as Comment);
    if (!includePending) {
      items = items.filter((c) => c.status === 'active');
    }
    return items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  }

  const all = getLS<Comment[]>('pa_comments', []);
  let items = all.filter((c) => c.refType === refType && c.refId === refId);
  if (!includePending) {
    items = items.filter((c) => c.status === 'active');
  }
  return items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
}

export async function setCommentStatus(
  id: string,
  status: Comment['status']
): Promise<void> {
  if (canUseRemote && db) {
    const qRef = query(collection(db, 'comments'), where('id', '==', id));
    const snap = await getDocs(qRef);
    await Promise.all(
      snap.docs.map((d) => updateDoc(doc(db!, 'comments', d.id), { status }))
    );
    return;
  }

  const comments = getLS<Comment[]>('pa_comments', []);
  const next = comments.map((c) => (c.id === id ? { ...c, status } : c));
  setLS('pa_comments', next);
}

// ─── Bildirimler ────────────────────────────────────────────────────────────────

export async function addNotification(
  payload: Omit<Notification, 'id' | 'createdAt' | 'read'>
): Promise<string> {
  const entry: Notification = {
    ...payload,
    id: `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };

  if (canUseRemote && db) {
    const ref = await addDoc(collection(db, 'notifications'), entry);
    await updateDoc(ref, { id: entry.id });
    return entry.id;
  }

  const notifs = getLS<Notification[]>('pa_notifications', []);
  notifs.unshift(entry);
  setLS('pa_notifications', notifs);
  return entry.id;
}

export async function getUserNotifications(uid: string): Promise<Notification[]> {
  if (canUseRemote && db) {
    const qRef = query(collection(db, 'notifications'), where('uid', '==', uid));
    const snap = await getDocs(qRef);
    const items = snap.docs.map((d) => d.data() as Notification);
    return items
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 50);
  }

  const notifs = getLS<Notification[]>('pa_notifications', []);
  return notifs
    .filter((n) => n.uid === uid)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 50);
}

export async function markNotificationRead(id: string): Promise<void> {
  if (canUseRemote && db) {
    const qRef = query(collection(db, 'notifications'), where('id', '==', id));
    const snap = await getDocs(qRef);
    await Promise.all(
      snap.docs.map((d) => updateDoc(doc(db!, 'notifications', d.id), { read: true }))
    );
    return;
  }

  const notifs = getLS<Notification[]>('pa_notifications', []);
  const next = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
  setLS('pa_notifications', next);
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

// ─── Admin Başvuruları ──────────────────────────────────────────────────────────
export interface AdminApplication {
  id: string;
  uid: string;
  username: string;
  displayName: string;
  email: string;
  fullName: string;          // Ad Soyad
  profession: string;        // Meslek / Unvan
  reason: string;            // Neden admin olmak istiyorsunuz?
  linkedin?: string;
  github?: string;
  twitter?: string;
  experience: string;        // Deneyim alanı
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
}

const APPLICATIONS_KEY = 'pa_admin_applications';

export async function submitAdminApplication(
  payload: Omit<AdminApplication, 'id' | 'createdAt' | 'status'>
): Promise<void> {
  // undefined alanları Firestore kabul etmez, temizle
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  );

  const entry: AdminApplication = {
    ...cleanPayload,
    id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  } as AdminApplication;

  if (canUseRemote && db) {
    const ref = await addDoc(collection(db, 'adminApplications'), entry);
    await updateDoc(ref, { id: ref.id });
    return;
  }
  const list = getLS<AdminApplication[]>(APPLICATIONS_KEY, []);
  list.unshift(entry);
  setLS(APPLICATIONS_KEY, list);
}

export async function getAdminApplications(): Promise<AdminApplication[]> {
  if (canUseRemote && db) {
    const snap = await getDocs(collection(db, 'adminApplications'));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as AdminApplication))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  return getLS<AdminApplication[]>(APPLICATIONS_KEY, [])
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function getUserAdminApplication(uid: string): Promise<AdminApplication | null> {
  if (canUseRemote && db) {
    const q = query(collection(db, 'adminApplications'), where('uid', '==', uid));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminApplication));
    return docs.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
  }
  const list = getLS<AdminApplication[]>(APPLICATIONS_KEY, []);
  const found = list.filter((a) => a.uid === uid)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return found[0] || null;
}

export async function reviewAdminApplication(
  id: string,
  status: 'approved' | 'rejected',
  reviewedBy: string,
  reviewNote?: string
): Promise<void> {
  const now = new Date().toISOString();
  if (canUseRemote && db) {
    const q = query(collection(db, 'adminApplications'), where('id', '==', id));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) =>
      updateDoc(doc(db!, 'adminApplications', d.id), { status, reviewedAt: now, reviewedBy, reviewNote: reviewNote || '' })
    ));
    // Eğer onaylandıysa kullanıcının rolünü admin yap
    if (status === 'approved') {
      const appData = snap.docs[0]?.data() as AdminApplication | undefined;
      if (appData?.uid) {
        const userRef = doc(db!, 'users', appData.uid);
        await updateDoc(userRef, { role: 'admin' });
      }
    }
    return;
  }
  const list = getLS<AdminApplication[]>(APPLICATIONS_KEY, []);
  const next = list.map((a) =>
    a.id === id ? { ...a, status, reviewedAt: now, reviewedBy, reviewNote: reviewNote || '' } : a
  );
  setLS(APPLICATIONS_KEY, next);
  // localStorage modunda da rolü güncelle
  if (status === 'approved') {
    const app = list.find((a) => a.id === id);
    if (app) {
      const users = getLS<FirestoreUser[]>(USERS_KEY, []);
      const u = users.findIndex((u) => u.uid === app.uid);
      if (u !== -1) { users[u] = { ...users[u], role: 'admin' }; setLS(USERS_KEY, users); }
    }
  }
}


// ─── Şikayet (Flag/Report) Sistemi ─────────────────────────────────────────────
export interface ContentReport {
  id: string;
  refType: 'project' | 'blog' | 'article' | 'comment';
  refId: string;
  refTitle: string;
  reporterUid: string;
  reporterUsername: string;
  reason: string;
  details?: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

const REPORTS_KEY = 'pa_reports';

export async function addReport(payload: Omit<ContentReport, 'id' | 'createdAt' | 'status'>): Promise<void> {
  const entry: ContentReport = {
    ...payload,
    id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'open',
  };
  if (canUseRemote && db) {
    const ref = await addDoc(collection(db, 'reports'), entry);
    await updateDoc(ref, { id: ref.id });
    return;
  }
  const list = getLS<ContentReport[]>(REPORTS_KEY, []);
  list.unshift(entry);
  setLS(REPORTS_KEY, list);
}

export async function getReports(): Promise<ContentReport[]> {
  if (canUseRemote && db) {
    const snap = await getDocs(collection(db, 'reports'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContentReport))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  return getLS<ContentReport[]>(REPORTS_KEY, [])
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function updateReportStatus(id: string, status: ContentReport['status'], resolvedBy: string): Promise<void> {
  if (canUseRemote && db) {
    const q = query(collection(db, 'reports'), where('id', '==', id));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => updateDoc(doc(db!, 'reports', d.id), {
      status, resolvedAt: new Date().toISOString(), resolvedBy
    })));
    return;
  }
  const list = getLS<ContentReport[]>(REPORTS_KEY, []);
  const next = list.map((r) => r.id === id
    ? { ...r, status, resolvedAt: new Date().toISOString(), resolvedBy }
    : r
  );
  setLS(REPORTS_KEY, next);
}

// ─── Admin Notları ──────────────────────────────────────────────────────────────
export interface AdminNote {
  id: string;
  refType: 'project' | 'blog' | 'article' | 'user';
  refId: string;
  authorEmail: string;
  note: string;
  createdAt: string;
}

const ADMIN_NOTES_KEY = 'pa_admin_notes';

export async function addAdminNote(payload: Omit<AdminNote, 'id' | 'createdAt'>): Promise<void> {
  const entry: AdminNote = {
    ...payload,
    id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  if (canUseRemote && db) {
    const ref = await addDoc(collection(db, 'adminNotes'), entry);
    await updateDoc(ref, { id: ref.id });
    return;
  }
  const list = getLS<AdminNote[]>(ADMIN_NOTES_KEY, []);
  list.unshift(entry);
  setLS(ADMIN_NOTES_KEY, list);
}

export async function getAdminNotes(refType: AdminNote['refType'], refId: string): Promise<AdminNote[]> {
  if (canUseRemote && db) {
    const q = query(
      collection(db, 'adminNotes'),
      where('refType', '==', refType),
      where('refId', '==', refId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminNote))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  return getLS<AdminNote[]>(ADMIN_NOTES_KEY, [])
    .filter((n) => n.refType === refType && n.refId === refId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

// ─── Otomatik Moderasyon Kuralları ──────────────────────────────────────────────
export interface ModerationRule {
  id: string;
  keyword: string;
  action: 'flag' | 'reject';
  createdAt: string;
  createdBy: string;
}

const MOD_RULES_KEY = 'pa_mod_rules';

export async function getModerationRules(): Promise<ModerationRule[]> {
  if (canUseRemote && db) {
    const snap = await getDocs(collection(db, 'moderationRules'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ModerationRule));
  }
  return getLS<ModerationRule[]>(MOD_RULES_KEY, []);
}

export async function addModerationRule(keyword: string, action: ModerationRule['action'], createdBy: string): Promise<void> {
  const entry: ModerationRule = {
    id: `rule_${Date.now()}`,
    keyword: keyword.toLowerCase().trim(),
    action,
    createdAt: new Date().toISOString(),
    createdBy,
  };
  if (canUseRemote && db) {
    const ref = await addDoc(collection(db, 'moderationRules'), entry);
    await updateDoc(ref, { id: ref.id });
    return;
  }
  const list = getLS<ModerationRule[]>(MOD_RULES_KEY, []);
  list.push(entry);
  setLS(MOD_RULES_KEY, list);
}

export async function deleteModerationRule(id: string): Promise<void> {
  if (canUseRemote && db) {
    // keyword query yerine artik direk doc id ile siliyoruz (daha guvenli)
    const ref = doc(db, 'moderationRules', id);
    await deleteDoc(ref);
    return;
  }
  const list = getLS<ModerationRule[]>(MOD_RULES_KEY, []);
  setLS(MOD_RULES_KEY, list.filter((r) => r.id !== id));
}

// ─── Toplu Aksiyon Fonksiyonları ────────────────────────────────────────────────
export async function approveAllPending(): Promise<{ projects: number; blogs: number; articles: number }> {
  const [projects, blogs, articles] = await Promise.all([
    getProjectsAdmin(),
    getBlogsAdmin(),
    getArticles(),
  ]);
  const pendingProjects = projects.filter((p) => p.status === 'pending');
  const pendingBlogs = blogs.filter((b) => b.status === 'pending');
  const pendingArticles = articles.filter((a) => a.status === 'pending');

  await Promise.all([
    ...pendingProjects.map((p) => setProjectStatus(p.id, 'active')),
    ...pendingBlogs.map((b) => setBlogStatus(b.id, 'active')),
    ...pendingArticles.map((a) => setArticleStatus(a.id, 'active')),
  ]);

  return {
    projects: pendingProjects.length,
    blogs: pendingBlogs.length,
    articles: pendingArticles.length,
  };
}

// ─── Gamification & Community ───────────────────────────────────────────────────

export async function toggleFollowUser(currentUid: string, targetUid: string): Promise<void> {
  const currentUser = await getUserProfile(currentUid);
  const targetUser = await getUserProfile(targetUid);
  if (!currentUser || !targetUser) return;

  const following = currentUser.following || [];
  const followers = targetUser.followers || [];

  const isFollowing = following.includes(targetUid);

  const nextFollowing = isFollowing ? following.filter((id) => id !== targetUid) : [...following, targetUid];
  const nextFollowers = isFollowing ? followers.filter((id) => id !== currentUid) : [...followers, currentUid];

  await updateUserProfile(currentUid, { following: nextFollowing });
  await updateUserProfile(targetUid, { followers: nextFollowers });
}

export async function toggleBookmark(uid: string, refType: Bookmark['refType'], refId: string): Promise<void> {
  const user = await getUserProfile(uid);
  if (!user) return;
  
  const bookmarks = user.bookmarks || [];
  const isBookmarked = bookmarks.some((b) => b.refType === refType && b.refId === refId);
  
  const nextBookmarks = isBookmarked 
    ? bookmarks.filter((b) => !(b.refType === refType && b.refId === refId))
    : [...bookmarks, { refType, refId, savedAt: new Date().toISOString() }];
    
  await updateUserProfile(uid, { bookmarks: nextBookmarks });
}

export async function updateXpAndLevel(uid: string, xpToAdd: number): Promise<void> {
  const user = await getUserProfile(uid);
  if (!user) return;
  
  const currentXp = user.xp || 0;
  const newXp = currentXp + xpToAdd;
  
  let newLevel = 'Çaylak';
  if (newXp >= 100) newLevel = 'Geliştirici';
  if (newXp >= 500) newLevel = 'Kıdemli';
  if (newXp >= 1000) newLevel = 'Usta';
  
  await updateUserProfile(uid, { xp: newXp, level: newLevel });
}

export async function addDevlog(projectId: string, version: string, content: string): Promise<void> {
  const entry: DevlogEntry = {
    id: `devlog_${Date.now()}`,
    version,
    content,
    createdAt: new Date().toISOString()
  };
  
  if (canUseRemote && db) {
    const ref = doc(db, 'projects', projectId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const project = snap.data() as FirestoreProject;
    const devlogs = project.devlogs || [];
    await updateDoc(ref, { devlogs: [entry, ...devlogs] });
    return;
  }
  
  const projects = getLS<FirestoreProject[]>('pa_projects', []);
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx !== -1) {
    const devlogs = projects[idx].devlogs || [];
    projects[idx].devlogs = [entry, ...devlogs];
    setLS('pa_projects', projects);
  }
}

export async function createAppeal(payload: Omit<Appeal, 'id' | 'createdAt' | 'status'>): Promise<void> {
  const entry: Appeal = {
    ...payload,
    id: `appeal_${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  if (canUseRemote && db) {
    const ref = await addDoc(collection(db, 'appeals'), entry);
    await updateDoc(ref, { id: ref.id });
    return;
  }
  
  const list = getLS<Appeal[]>('pa_appeals', []);
  list.unshift(entry);
  setLS('pa_appeals', list);
}

export async function getAppeals(): Promise<Appeal[]> {
  if (canUseRemote && db) {
    const snap = await getDocs(collection(db, 'appeals'));
    return snap.docs.map((d) => d.data() as Appeal).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  return getLS<Appeal[]>('pa_appeals', []);
}

export async function updateAppealStatus(id: string, status: Appeal['status'], resolvedBy: string): Promise<void> {
  const updateData = { status, resolvedAt: new Date().toISOString(), resolvedBy };
  if (canUseRemote && db) {
    await updateDoc(doc(db, 'appeals', id), updateData);
    return;
  }
  
  const list = getLS<Appeal[]>('pa_appeals', []);
  const idx = list.findIndex((a) => a.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updateData };
    setLS('pa_appeals', list);
  }
}

