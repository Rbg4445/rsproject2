import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  increment,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { UserRole, UserStatus } from '../types';

// ─── Kullanıcı Profili ────────────────────────────────────────────────────────

export interface FirestoreUser {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  bio?: string;
  avatar?: string;
  skills?: string[];
  github?: string;
  twitter?: string;
  website?: string;
  role: UserRole;
  status: UserStatus;
  banReason?: string;
  emailVerified?: boolean;
  createdAt: Timestamp | null;
  lastLogin?: Timestamp | null;
}

export async function createUserProfile(
  uid: string,
  data: Omit<FirestoreUser, 'uid' | 'createdAt'>
): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    uid,
    ...data,
    bio: data.bio || '',
    skills: data.skills || [],
    github: data.github || '',
    twitter: data.twitter || '',
    website: data.website || '',
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<FirestoreUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as FirestoreUser) : null;
}

export async function getUserByUsername(username: string): Promise<FirestoreUser | null> {
  const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as FirestoreUser;
}

export async function updateUserProfile(uid: string, updates: Partial<FirestoreUser>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { ...updates });
}

export async function getAllUsers(): Promise<FirestoreUser[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => d.data() as FirestoreUser);
}

export async function updateLastLogin(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { lastLogin: serverTimestamp() });
}

// ─── Projeler ─────────────────────────────────────────────────────────────────

export interface FirestoreProject {
  id: string;
  userId: string;
  authorUsername: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  description: string;
  category: 'egitim' | 'kodlama' | 'akademi' | 'tasarim';
  tags: string[];
  image: string;
  difficulty: 'Başlangıç' | 'Orta' | 'İleri';
  duration: string;
  github?: string;
  demo?: string;
  createdAt: Timestamp | null;
  likes: number;
  likedBy: string[];
  status: 'active' | 'hidden' | 'removed';
  reportCount: number;
}

export async function addProject(data: Omit<FirestoreProject, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'projects'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function getAllProjects(): Promise<FirestoreProject[]> {
  const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreProject));
}

export async function getUserProjects(userId: string): Promise<FirestoreProject[]> {
  const q = query(collection(db, 'projects'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreProject));
}

export async function deleteProject(projectId: string): Promise<void> {
  await deleteDoc(doc(db, 'projects', projectId));
}

export async function updateProject(projectId: string, updates: Partial<FirestoreProject>): Promise<void> {
  await updateDoc(doc(db, 'projects', projectId), updates);
}

export async function toggleProjectLike(projectId: string, userId: string, liked: boolean): Promise<void> {
  const ref = doc(db, 'projects', projectId);
  if (liked) {
    await updateDoc(ref, {
      likes: increment(-1),
      likedBy: (await getDoc(ref)).data()?.likedBy?.filter((id: string) => id !== userId) || [],
    });
  } else {
    const snap = await getDoc(ref);
    const likedBy = snap.data()?.likedBy || [];
    await updateDoc(ref, {
      likes: increment(1),
      likedBy: [...likedBy, userId],
    });
  }
}

// ─── Bloglar ──────────────────────────────────────────────────────────────────

export interface FirestoreBlog {
  id: string;
  userId: string;
  authorUsername: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  likes: number;
  likedBy: string[];
  views: number;
  status: 'active' | 'hidden' | 'removed';
  reportCount: number;
}

export async function addBlog(data: Omit<FirestoreBlog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'blogs'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function getAllBlogs(): Promise<FirestoreBlog[]> {
  const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreBlog));
}

export async function getUserBlogs(userId: string): Promise<FirestoreBlog[]> {
  const q = query(collection(db, 'blogs'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreBlog));
}

export async function getBlog(blogId: string): Promise<FirestoreBlog | null> {
  const snap = await getDoc(doc(db, 'blogs', blogId));
  return snap.exists() ? ({ ...snap.data(), id: snap.id } as FirestoreBlog) : null;
}

export async function updateBlog(blogId: string, updates: Partial<FirestoreBlog>): Promise<void> {
  await updateDoc(doc(db, 'blogs', blogId), { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteBlog(blogId: string): Promise<void> {
  await deleteDoc(doc(db, 'blogs', blogId));
}

export async function incrementBlogViews(blogId: string): Promise<void> {
  await updateDoc(doc(db, 'blogs', blogId), { views: increment(1) });
}

export async function toggleBlogLike(blogId: string, userId: string, liked: boolean): Promise<void> {
  const ref = doc(db, 'blogs', blogId);
  if (liked) {
    const snap = await getDoc(ref);
    const likedBy = snap.data()?.likedBy?.filter((id: string) => id !== userId) || [];
    await updateDoc(ref, { likes: increment(-1), likedBy });
  } else {
    const snap = await getDoc(ref);
    const likedBy = snap.data()?.likedBy || [];
    await updateDoc(ref, { likes: increment(1), likedBy: [...likedBy, userId] });
  }
}

// ─── Raporlar ─────────────────────────────────────────────────────────────────

export interface FirestoreReport {
  id: string;
  reporterId: string;
  targetType: 'project' | 'blog' | 'user';
  targetId: string;
  reason: string;
  details: string;
  createdAt: Timestamp | null;
  status: 'pending' | 'resolved' | 'dismissed';
}

export async function addReport(data: Omit<FirestoreReport, 'id' | 'createdAt'>): Promise<void> {
  const ref = await addDoc(collection(db, 'reports'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await updateDoc(ref, { id: ref.id });
}

export async function getAllReports(): Promise<FirestoreReport[]> {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreReport));
}

export async function updateReport(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  await updateDoc(doc(db, 'reports', reportId), { status });
}

// ─── Admin İşlemleri ──────────────────────────────────────────────────────────

export async function banUser(uid: string, reason: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { status: 'banned', banReason: reason });
}

export async function unbanUser(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { status: 'active', banReason: '' });
}

export async function changeUserRole(uid: string, role: UserRole): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role });
}

export async function removeContent(
  type: 'project' | 'blog',
  id: string,
  status: 'removed' | 'active'
): Promise<void> {
  const col = type === 'project' ? 'projects' : 'blogs';
  await updateDoc(doc(db, col, id), { status });
}

// ─── Aktivite Logları ─────────────────────────────────────────────────────────

export interface FirestoreLog {
  id: string;
  userId?: string;
  username?: string;
  action: string;
  details?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  createdAt: Timestamp | null;
  ip?: string;
}

export async function addLog(data: Omit<FirestoreLog, 'id' | 'createdAt'>): Promise<void> {
  const ref = await addDoc(collection(db, 'logs'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await updateDoc(ref, { id: ref.id });
}

export async function getLogs(limitCount = 100): Promise<FirestoreLog[]> {
  const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreLog));
}

export async function clearLogs(): Promise<void> {
  const snap = await getDocs(collection(db, 'logs'));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
