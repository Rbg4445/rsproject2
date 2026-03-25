import { User, UserProject, BlogPost, Report } from '../types';
import { hashPassword, verifyPassword, generateSessionToken, logActivity } from '../utils/security';

const USERS_KEY = 'projeakademi_users';
const PROJECTS_KEY = 'projeakademi_projects';
const BLOGS_KEY = 'projeakademi_blogs';
const CURRENT_USER_KEY = 'projeakademi_current_user';
const SESSION_KEY = 'projeakademi_session';
const REPORTS_KEY = 'projeakademi_reports';

function getItem<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setItem<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Seed demo data on first load
export function seedDemoData() {
  const users = getItem<User>(USERS_KEY);
  if (users.length > 0) {
    // Eski kullanıcıları güncelle (rol ekle)
    let updated = false;
    const fixedUsers = users.map((u) => {
      if (!u.role) {
        updated = true;
        return { ...u, role: 'user' as const, status: 'active' as const };
      }
      return u;
    });
    if (updated) setItem(USERS_KEY, fixedUsers);

    // Eski projeleri güncelle
    const projects = getItem<UserProject>(PROJECTS_KEY);
    const fixedProjects = projects.map((p) => {
      if (!p.status) return { ...p, status: 'active' as const };
      return p;
    });
    setItem(PROJECTS_KEY, fixedProjects);

    // Eski blogları güncelle
    const blogs = getItem<BlogPost>(BLOGS_KEY);
    const fixedBlogs = blogs.map((b) => {
      if (!b.status) return { ...b, status: 'active' as const };
      return b;
    });
    setItem(BLOGS_KEY, fixedBlogs);
    return;
  }

  // Admin kullanıcısı
  const adminUser: User = {
    id: 'admin-user-1',
    username: 'admin',
    email: 'admin@projeakademi.com',
    password: hashPassword('Admin@2025!'),
    displayName: 'Site Yöneticisi',
    bio: 'ProjeAkademi platform yöneticisi.',
    avatar: '',
    skills: ['Yönetim', 'Moderasyon'],
    createdAt: '2025-01-01T00:00:00Z',
    role: 'admin',
    status: 'active',
  };

  const demoUser: User = {
    id: 'demo-user-1',
    username: 'ahmet_dev',
    email: 'ahmet@example.com',
    password: hashPassword('123456'),
    displayName: 'Ahmet Yılmaz',
    bio: 'Full-Stack Developer & Eğitmen. React, Node.js ve Python ile projeler geliştiriyorum.',
    avatar: '',
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'TailwindCSS'],
    github: 'https://github.com',
    twitter: 'https://twitter.com',
    website: 'https://example.com',
    createdAt: '2025-01-01T00:00:00Z',
    role: 'user',
    status: 'active',
  };

  const demoUser2: User = {
    id: 'demo-user-2',
    username: 'elif_code',
    email: 'elif@example.com',
    password: hashPassword('123456'),
    displayName: 'Elif Kaya',
    bio: 'UI/UX Designer & Frontend Developer. Tasarım ve kod arasında köprü kuruyorum.',
    avatar: '',
    skills: ['Figma', 'React', 'CSS', 'JavaScript', 'Adobe XD'],
    github: 'https://github.com',
    createdAt: '2025-02-15T00:00:00Z',
    role: 'user',
    status: 'active',
  };

  setItem(USERS_KEY, [adminUser, demoUser, demoUser2]);

  const demoProjects: UserProject[] = [
    {
      id: 'proj-1',
      userId: 'demo-user-1',
      title: 'React ile E-Ticaret Uygulaması',
      description: 'Modern React, TypeScript ve Tailwind CSS kullanarak sıfırdan bir e-ticaret platformu geliştirdim.',
      category: 'kodlama',
      tags: ['React', 'TypeScript', 'Tailwind CSS', 'Redux'],
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
      difficulty: 'İleri',
      duration: '8 hafta',
      github: '#',
      demo: '#',
      createdAt: '2025-03-15T00:00:00Z',
      likes: 42,
      status: 'active',
    },
    {
      id: 'proj-2',
      userId: 'demo-user-1',
      title: 'Python ile Veri Bilimi Eğitimi',
      description: 'Pandas, NumPy ve Matplotlib kütüphaneleri ile veri analizi temelleri.',
      category: 'egitim',
      tags: ['Python', 'Pandas', 'NumPy', 'Veri Bilimi'],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      difficulty: 'Orta',
      duration: '6 hafta',
      github: '#',
      createdAt: '2025-02-20T00:00:00Z',
      likes: 38,
      status: 'active',
    },
    {
      id: 'proj-3',
      userId: 'demo-user-2',
      title: 'UI/UX Tasarım Rehberi',
      description: 'Figma ile mobil uygulama tasarımı ve kullanıcı deneyimi prensipleri.',
      category: 'tasarim',
      tags: ['Figma', 'UI/UX', 'Prototip', 'Mobil'],
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
      difficulty: 'Başlangıç',
      duration: '4 hafta',
      demo: '#',
      createdAt: '2025-04-05T00:00:00Z',
      likes: 25,
      status: 'active',
    },
    {
      id: 'proj-4',
      userId: 'demo-user-1',
      title: 'Node.js ile REST API Geliştirme',
      description: 'Express.js ve MongoDB kullanarak ölçeklenebilir RESTful API tasarımı.',
      category: 'kodlama',
      tags: ['Node.js', 'Express', 'MongoDB', 'REST API'],
      image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&h=400&fit=crop',
      difficulty: 'Orta',
      duration: '5 hafta',
      github: '#',
      demo: '#',
      createdAt: '2025-03-01T00:00:00Z',
      likes: 31,
      status: 'active',
    },
    {
      id: 'proj-5',
      userId: 'demo-user-2',
      title: 'Flutter ile Mobil Uygulama',
      description: 'Cross-platform mobil uygulama geliştirme. Dart programlama dili ve Firebase entegrasyonu.',
      category: 'kodlama',
      tags: ['Flutter', 'Dart', 'Firebase', 'Mobil'],
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop',
      difficulty: 'Orta',
      duration: '7 hafta',
      github: '#',
      demo: '#',
      createdAt: '2025-04-10T00:00:00Z',
      likes: 19,
      status: 'active',
    },
    {
      id: 'proj-6',
      userId: 'demo-user-1',
      title: 'Makine Öğrenmesi Araştırma Projesi',
      description: 'Doğal dil işleme tekniklerini kullanarak Türkçe metin sınıflandırma modeli geliştirme.',
      category: 'akademi',
      tags: ['Machine Learning', 'NLP', 'TensorFlow', 'BERT'],
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
      difficulty: 'İleri',
      duration: '12 hafta',
      github: '#',
      demo: '#',
      createdAt: '2025-01-10T00:00:00Z',
      likes: 55,
      status: 'active',
    },
  ];

  setItem(PROJECTS_KEY, demoProjects);

  const demoBlogs: BlogPost[] = [
    {
      id: 'blog-1',
      userId: 'demo-user-1',
      title: 'React 19 ile Gelen Yenilikler',
      content: `React 19 ile birçok heyecan verici yenilik geldi.\n\n## Server Components\n\nServer Components artık varsayılan olarak destekleniyor.\n\n## Actions\n\nForm işlemleri için yeni Action API'si ile sunucu tarafında çalışan fonksiyonlar tanımlayabilirsiniz.\n\n## use() Hook\n\nYeni \`use()\` hook'u ile promise'leri ve context'leri doğrudan bileşen içinde kullanabilirsiniz.\n\n## Sonuç\n\nReact 19 performans, geliştirici deneyimi ve modern web uygulamaları için büyük adımlar atıyor.`,
      excerpt: 'React 19 ile gelen Server Components, Actions, use() hook ve compiler optimizasyonlarını keşfedin.',
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
      tags: ['React', 'JavaScript', 'Frontend'],
      createdAt: '2025-04-01T10:00:00Z',
      updatedAt: '2025-04-01T10:00:00Z',
      likes: 67,
      views: 1240,
      status: 'active',
    },
    {
      id: 'blog-2',
      userId: 'demo-user-1',
      title: 'TypeScript ile Clean Code Yazma Rehberi',
      content: `Temiz ve sürdürülebilir kod yazmak her geliştiricinin hedefi olmalıdır.\n\n## 1. Interface ve Type Kullanımı\n\nHer zaman açık tip tanımlamaları kullanın. \`any\` tipinden kaçının.\n\n## 2. Fonksiyon Boyutu\n\nFonksiyonlar tek bir iş yapmalı ve 20-30 satırı geçmemelidir.\n\n## 3. İsimlendirme\n\nDeğişken ve fonksiyon isimleri açıklayıcı olmalıdır.\n\n## Sonuç\n\nClean code yazmak bir alışkanlıktır.`,
      excerpt: 'TypeScript projelerinde temiz, okunabilir ve sürdürülebilir kod yazma prensipleri.',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
      tags: ['TypeScript', 'Clean Code', 'Best Practices'],
      createdAt: '2025-03-15T14:00:00Z',
      updatedAt: '2025-03-16T09:00:00Z',
      likes: 89,
      views: 2100,
      status: 'active',
    },
    {
      id: 'blog-3',
      userId: 'demo-user-2',
      title: 'Modern UI Tasarım Trendleri 2025',
      content: `2025 yılında UI tasarım dünyasında öne çıkan trendleri inceleyeceğiz.\n\n## Glassmorphism\n\nCam efekti veren yarı saydam arka planlar popülerliğini sürdürüyor.\n\n## Micro-interactions\n\nKullanıcı etkileşimlerinde küçük animasyonlar büyük fark yaratıyor.\n\n## Dark Mode\n\nKaranlık tema artık bir standart haline geldi.\n\n## Sonuç\n\nModern tasarım trendlerini takip etmek önemlidir.`,
      excerpt: '2025 yılında öne çıkan glassmorphism, micro-interactions, dark mode ve AI-driven design trendleri.',
      coverImage: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800&h=400&fit=crop',
      tags: ['UI/UX', 'Tasarım', 'Trendler'],
      createdAt: '2025-03-20T08:00:00Z',
      updatedAt: '2025-03-20T08:00:00Z',
      likes: 45,
      views: 890,
      status: 'active',
    },
  ];

  setItem(BLOGS_KEY, demoBlogs);
}

// ===== USERS =====
export function getUsers(): User[] {
  return getItem<User>(USERS_KEY);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function getUserByUsername(username: string): User | undefined {
  return getUsers().find((u) => u.username === username);
}

export function registerUser(data: {
  username: string;
  email: string;
  password: string;
  displayName: string;
}): { success: boolean; error?: string; user?: User } {
  const users = getUsers();

  if (users.find((u) => u.email === data.email)) {
    logActivity({ action: 'REGISTER_FAIL', details: `Email zaten kayıtlı: ${data.email}`, success: false });
    return { success: false, error: 'Bu email adresi zaten kayıtlı.' };
  }
  if (users.find((u) => u.username === data.username)) {
    logActivity({ action: 'REGISTER_FAIL', details: `Username zaten alınmış: ${data.username}`, success: false });
    return { success: false, error: 'Bu kullanıcı adı zaten alınmış.' };
  }

  const newUser: User = {
    id: 'user-' + Date.now(),
    username: data.username,
    email: data.email,
    password: hashPassword(data.password),
    displayName: data.displayName,
    bio: '',
    avatar: '',
    skills: [],
    createdAt: new Date().toISOString(),
    role: 'user',
    status: 'active',
  };

  users.push(newUser);
  setItem(USERS_KEY, users);
  logActivity({ userId: newUser.id, action: 'REGISTER_SUCCESS', details: `Yeni kullanıcı: ${data.username}`, success: true });
  return { success: true, user: newUser };
}

export function loginUser(email: string, password: string): { success: boolean; error?: string; user?: User } {
  const users = getUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    logActivity({ action: 'LOGIN_FAIL', details: `Kullanıcı bulunamadı: ${email}`, success: false });
    return { success: false, error: 'Email veya şifre hatalı.' };
  }

  if (user.status === 'banned') {
    logActivity({ userId: user.id, action: 'LOGIN_BANNED', details: `Banlı kullanıcı giriş denemesi`, success: false });
    return { success: false, error: `Hesabınız yasaklandı. Sebep: ${user.banReason || 'Kural ihlali'}` };
  }

  if (user.status === 'suspended') {
    logActivity({ userId: user.id, action: 'LOGIN_SUSPENDED', details: `Askıya alınmış kullanıcı`, success: false });
    return { success: false, error: 'Hesabınız geçici olarak askıya alındı. Destek ile iletişime geçin.' };
  }

  // Şifre doğrulama (eski düz metin şifreler için geriye dönük uyumluluk)
  const passwordValid = verifyPassword(password, user.password) || user.password === password;

  if (!passwordValid) {
    logActivity({ userId: user.id, action: 'LOGIN_FAIL', details: `Yanlış şifre: ${email}`, success: false });
    return { success: false, error: 'Email veya şifre hatalı.' };
  }

  // Session token oluştur
  const sessionToken = generateSessionToken();
  const updatedUser = { ...user, sessionToken, lastLogin: new Date().toISOString() };
  const allUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
  setItem(USERS_KEY, allUsers);

  // Session'ı kaydet
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, token: sessionToken, createdAt: Date.now() }));

  logActivity({ userId: user.id, action: 'LOGIN_SUCCESS', details: `Başarılı giriş: ${email}`, success: true });
  return { success: true, user: updatedUser };
}

export function logoutUser(userId: string): void {
  const users = getUsers();
  const allUsers = users.map((u) => (u.id === userId ? { ...u, sessionToken: undefined } : u));
  setItem(USERS_KEY, allUsers);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  logActivity({ userId, action: 'LOGOUT', details: 'Kullanıcı çıkış yaptı', success: true });
}

export function validateSession(): User | null {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;
    const session = JSON.parse(sessionData);
    // 7 günden eski session'ları geçersiz say
    if (Date.now() - session.createdAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    const user = getUserById(session.userId);
    if (!user || user.sessionToken !== session.token) return null;
    if (user.status === 'banned' || user.status === 'suspended') return null;
    return user;
  } catch {
    return null;
  }
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return undefined;
  users[index] = { ...users[index], ...updates };
  setItem(USERS_KEY, users);
  return users[index];
}

export function setCurrentUser(user: User | null) {
  if (user) {
    // Şifreyi saklamadan kaydet
    const { password: _p, sessionToken: _s, ...safeUser } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getCurrentUser(): User | null {
  try {
    const session = validateSession();
    return session;
  } catch {
    return null;
  }
}

// ===== ADMIN FUNCTIONS =====
export function banUser(adminId: string, userId: string, reason: string): boolean {
  const admin = getUserById(adminId);
  if (!admin || admin.role !== 'admin') return false;
  const updated = updateUser(userId, { status: 'banned', banReason: reason });
  logActivity({ userId: adminId, action: 'BAN_USER', details: `Admin ${adminId} kullanıcı ${userId} banlı: ${reason}`, success: !!updated });
  return !!updated;
}

export function unbanUser(adminId: string, userId: string): boolean {
  const admin = getUserById(adminId);
  if (!admin || admin.role !== 'admin') return false;
  const updated = updateUser(userId, { status: 'active', banReason: undefined });
  logActivity({ userId: adminId, action: 'UNBAN_USER', details: `Admin ${adminId} kullanıcı ${userId} ban kaldırıldı`, success: !!updated });
  return !!updated;
}

export function changeUserRole(adminId: string, userId: string, role: 'user' | 'moderator' | 'admin'): boolean {
  const admin = getUserById(adminId);
  if (!admin || admin.role !== 'admin') return false;
  const updated = updateUser(userId, { role });
  logActivity({ userId: adminId, action: 'CHANGE_ROLE', details: `Kullanıcı ${userId} rolü ${role} yapıldı`, success: !!updated });
  return !!updated;
}

export function adminDeleteUser(adminId: string, userId: string): boolean {
  const admin = getUserById(adminId);
  if (!admin || admin.role !== 'admin') return false;
  const users = getUsers().filter((u) => u.id !== userId);
  setItem(USERS_KEY, users);
  // Kullanıcının proje ve bloglarını gizle
  const projects = getItem<UserProject>(PROJECTS_KEY).map((p) =>
    p.userId === userId ? { ...p, status: 'removed' as const } : p
  );
  setItem(PROJECTS_KEY, projects);
  const blogs = getItem<BlogPost>(BLOGS_KEY).map((b) =>
    b.userId === userId ? { ...b, status: 'removed' as const } : b
  );
  setItem(BLOGS_KEY, blogs);
  logActivity({ userId: adminId, action: 'DELETE_USER', details: `Admin kullanıcı ${userId} sildi`, success: true });
  return true;
}

export function adminDeleteProject(adminId: string, projectId: string): boolean {
  const admin = getUserById(adminId);
  if (!admin || (admin.role !== 'admin' && admin.role !== 'moderator')) return false;
  const projects = getItem<UserProject>(PROJECTS_KEY).map((p) =>
    p.id === projectId ? { ...p, status: 'removed' as const } : p
  );
  setItem(PROJECTS_KEY, projects);
  logActivity({ userId: adminId, action: 'DELETE_PROJECT', details: `Proje ${projectId} kaldırıldı`, success: true });
  return true;
}

export function adminDeleteBlog(adminId: string, blogId: string): boolean {
  const admin = getUserById(adminId);
  if (!admin || (admin.role !== 'admin' && admin.role !== 'moderator')) return false;
  const blogs = getItem<BlogPost>(BLOGS_KEY).map((b) =>
    b.id === blogId ? { ...b, status: 'removed' as const } : b
  );
  setItem(BLOGS_KEY, blogs);
  logActivity({ userId: adminId, action: 'DELETE_BLOG', details: `Blog ${blogId} kaldırıldı`, success: true });
  return true;
}

export function restoreProject(adminId: string, projectId: string): boolean {
  const admin = getUserById(adminId);
  if (!admin || admin.role !== 'admin') return false;
  const projects = getItem<UserProject>(PROJECTS_KEY).map((p) =>
    p.id === projectId ? { ...p, status: 'active' as const } : p
  );
  setItem(PROJECTS_KEY, projects);
  return true;
}

export function restoreBlog(adminId: string, blogId: string): boolean {
  const admin = getUserById(adminId);
  if (!admin || admin.role !== 'admin') return false;
  const blogs = getItem<BlogPost>(BLOGS_KEY).map((b) =>
    b.id === blogId ? { ...b, status: 'active' as const } : b
  );
  setItem(BLOGS_KEY, blogs);
  return true;
}

// ===== PROJECTS =====
export function getAllProjects(): UserProject[] {
  return getItem<UserProject>(PROJECTS_KEY)
    .filter((p) => p.status !== 'removed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAllProjectsAdmin(): UserProject[] {
  return getItem<UserProject>(PROJECTS_KEY).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getProjectsByUser(userId: string): UserProject[] {
  return getAllProjects().filter((p) => p.userId === userId);
}

export function addProject(project: Omit<UserProject, 'id' | 'createdAt' | 'likes' | 'status'>): UserProject {
  const projects = getItem<UserProject>(PROJECTS_KEY);
  const newProject: UserProject = {
    ...project,
    id: 'proj-' + Date.now(),
    createdAt: new Date().toISOString(),
    likes: 0,
    status: 'active',
  };
  projects.push(newProject);
  setItem(PROJECTS_KEY, projects);
  logActivity({ userId: project.userId, action: 'ADD_PROJECT', details: `Yeni proje: ${project.title}`, success: true });
  return newProject;
}

export function deleteProject(id: string, userId: string): void {
  const projects = getItem<UserProject>(PROJECTS_KEY).map((p) =>
    p.id === id && p.userId === userId ? { ...p, status: 'removed' as const } : p
  );
  setItem(PROJECTS_KEY, projects);
  logActivity({ userId, action: 'DELETE_PROJECT', details: `Proje silindi: ${id}`, success: true });
}

export function likeProject(id: string): void {
  const projects = getItem<UserProject>(PROJECTS_KEY);
  const index = projects.findIndex((p) => p.id === id);
  if (index !== -1) {
    projects[index].likes += 1;
    setItem(PROJECTS_KEY, projects);
  }
}

// ===== BLOGS =====
export function getAllBlogs(): BlogPost[] {
  return getItem<BlogPost>(BLOGS_KEY)
    .filter((b) => b.status !== 'removed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAllBlogsAdmin(): BlogPost[] {
  return getItem<BlogPost>(BLOGS_KEY).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getBlogsByUser(userId: string): BlogPost[] {
  return getAllBlogs().filter((b) => b.userId === userId);
}

export function getBlogById(id: string): BlogPost | undefined {
  return getItem<BlogPost>(BLOGS_KEY).find((b) => b.id === id);
}

export function addBlog(blog: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'views' | 'status'>): BlogPost {
  const blogs = getItem<BlogPost>(BLOGS_KEY);
  const now = new Date().toISOString();
  const newBlog: BlogPost = {
    ...blog,
    id: 'blog-' + Date.now(),
    createdAt: now,
    updatedAt: now,
    likes: 0,
    views: 0,
    status: 'active',
  };
  blogs.push(newBlog);
  setItem(BLOGS_KEY, blogs);
  logActivity({ userId: blog.userId, action: 'ADD_BLOG', details: `Yeni blog: ${blog.title}`, success: true });
  return newBlog;
}

export function updateBlog(id: string, updates: Partial<BlogPost>): BlogPost | undefined {
  const blogs = getItem<BlogPost>(BLOGS_KEY);
  const index = blogs.findIndex((b) => b.id === id);
  if (index === -1) return undefined;
  blogs[index] = { ...blogs[index], ...updates, updatedAt: new Date().toISOString() };
  setItem(BLOGS_KEY, blogs);
  return blogs[index];
}

export function deleteBlog(id: string, userId: string): void {
  const blogs = getItem<BlogPost>(BLOGS_KEY).map((b) =>
    b.id === id && b.userId === userId ? { ...b, status: 'removed' as const } : b
  );
  setItem(BLOGS_KEY, blogs);
  logActivity({ userId, action: 'DELETE_BLOG', details: `Blog silindi: ${id}`, success: true });
}

export function likeBlog(id: string): void {
  const blogs = getItem<BlogPost>(BLOGS_KEY);
  const index = blogs.findIndex((b) => b.id === id);
  if (index !== -1) {
    blogs[index].likes += 1;
    setItem(BLOGS_KEY, blogs);
  }
}

export function incrementBlogViews(id: string): void {
  const blogs = getItem<BlogPost>(BLOGS_KEY);
  const index = blogs.findIndex((b) => b.id === id);
  if (index !== -1) {
    blogs[index].views += 1;
    setItem(BLOGS_KEY, blogs);
  }
}

// ===== REPORTS =====
export function getReports(): Report[] {
  return getItem<Report>(REPORTS_KEY).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addReport(report: Omit<Report, 'id' | 'createdAt' | 'status'>): Report {
  const reports = getItem<Report>(REPORTS_KEY);
  const newReport: Report = {
    ...report,
    id: 'report-' + Date.now(),
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  reports.push(newReport);
  setItem(REPORTS_KEY, reports);
  return newReport;
}

export function resolveReport(id: string, status: 'resolved' | 'dismissed'): void {
  const reports = getItem<Report>(REPORTS_KEY).map((r) =>
    r.id === id ? { ...r, status } : r
  );
  setItem(REPORTS_KEY, reports);
}

// ===== STATS =====
export function getAdminStats() {
  const users = getUsers();
  const projects = getItem<UserProject>(PROJECTS_KEY);
  const blogs = getItem<BlogPost>(BLOGS_KEY);
  const reports = getReports();
  const today = new Date().toDateString();

  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === 'active').length,
    bannedUsers: users.filter((u) => u.status === 'banned').length,
    adminUsers: users.filter((u) => u.role === 'admin').length,
    moderatorUsers: users.filter((u) => u.role === 'moderator').length,
    totalProjects: projects.filter((p) => p.status !== 'removed').length,
    removedProjects: projects.filter((p) => p.status === 'removed').length,
    totalBlogs: blogs.filter((b) => b.status !== 'removed').length,
    removedBlogs: blogs.filter((b) => b.status === 'removed').length,
    pendingReports: reports.filter((r) => r.status === 'pending').length,
    totalReports: reports.length,
    newUsersToday: users.filter((u) => new Date(u.createdAt).toDateString() === today).length,
    newProjectsToday: projects.filter((p) => new Date(p.createdAt).toDateString() === today).length,
  };
}
