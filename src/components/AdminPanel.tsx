import { useState, useEffect } from 'react';
import {
  Shield, Users, FolderOpen, BookOpen, AlertTriangle, BarChart3,
  Trash2, Ban, Search, RefreshCw,
  ArrowLeft, Activity, CheckCircle,
  TrendingUp, Database, Lock, Unlock, Flag, ChevronDown
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import * as db from '../store/db';
import { getActivityLogs, clearActivityLogs, ActivityLog } from '../utils/security';
import { User, UserProject, BlogPost, Report } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

type AdminTab = 'dashboard' | 'users' | 'projects' | 'blogs' | 'reports' | 'logs' | 'settings';

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 border border-red-200',
  moderator: 'bg-orange-100 text-orange-700 border border-orange-200',
  user: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  banned: 'bg-red-100 text-red-700',
  suspended: 'bg-yellow-100 text-yellow-700',
  removed: 'bg-red-100 text-red-700',
  hidden: 'bg-slate-100 text-slate-600',
};

const roleLabels: Record<string, string> = {
  admin: '🛡️ Admin',
  moderator: '⚡ Moderatör',
  user: '👤 Kullanıcı',
};

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { user: adminUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof db.getAdminStats> | null>(null);
  const [search, setSearch] = useState('');
  const [banModalUser, setBanModalUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [selectedUserRole, setSelectedUserRole] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    loadAll();
  }, [isAdmin]);

  const loadAll = () => {
    setUsers(db.getUsers());
    setProjects(db.getAllProjectsAdmin());
    setBlogs(db.getAllBlogsAdmin());
    setReports(db.getReports());
    setLogs(getActivityLogs());
    setStats(db.getAdminStats());
  };

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Erişim Reddedildi</h2>
          <p className="text-slate-400 mb-6">Bu alana erişim yetkiniz bulunmamaktadır.</p>
          <button onClick={onBack} className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition">
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const handleBanUser = () => {
    if (!adminUser || !banModalUser || !banReason.trim()) return;
    db.banUser(adminUser.id, banModalUser.id, banReason);
    setBanModalUser(null);
    setBanReason('');
    loadAll();
    notify(`${banModalUser.displayName} kullanıcısı yasaklandı.`);
  };

  const handleUnbanUser = (userId: string) => {
    if (!adminUser) return;
    db.unbanUser(adminUser.id, userId);
    loadAll();
    notify('Kullanıcı yasağı kaldırıldı.');
  };

  const handleChangeRole = (userId: string, role: 'user' | 'moderator' | 'admin') => {
    if (!adminUser) return;
    db.changeUserRole(adminUser.id, userId, role);
    loadAll();
    notify('Kullanıcı rolü güncellendi.');
  };

  const handleDeleteProject = (projectId: string) => {
    if (!adminUser || !confirm('Bu projeyi kaldırmak istediğinizden emin misiniz?')) return;
    db.adminDeleteProject(adminUser.id, projectId);
    loadAll();
    notify('Proje kaldırıldı.');
  };

  const handleRestoreProject = (projectId: string) => {
    if (!adminUser) return;
    db.restoreProject(adminUser.id, projectId);
    loadAll();
    notify('Proje geri yüklendi.');
  };

  const handleDeleteBlog = (blogId: string) => {
    if (!adminUser || !confirm('Bu blog yazısını kaldırmak istediğinizden emin misiniz?')) return;
    db.adminDeleteBlog(adminUser.id, blogId);
    loadAll();
    notify('Blog kaldırıldı.');
  };

  const handleRestoreBlog = (blogId: string) => {
    if (!adminUser) return;
    db.restoreBlog(adminUser.id, blogId);
    loadAll();
    notify('Blog geri yüklendi.');
  };

  const handleResolveReport = (reportId: string, status: 'resolved' | 'dismissed') => {
    db.resolveReport(reportId, status);
    loadAll();
    notify(status === 'resolved' ? 'Rapor çözüldü.' : 'Rapor reddedildi.');
  };

  const filteredUsers = users.filter((u) =>
    search === '' ||
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProjects = projects.filter((p) =>
    search === '' ||
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBlogs = blogs.filter((b) =>
    search === '' ||
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'users', label: 'Kullanıcılar', icon: <Users className="w-4 h-4" />, count: stats?.totalUsers },
    { id: 'projects', label: 'Projeler', icon: <FolderOpen className="w-4 h-4" />, count: stats?.totalProjects },
    { id: 'blogs', label: 'Bloglar', icon: <BookOpen className="w-4 h-4" />, count: stats?.totalBlogs },
    { id: 'reports', label: 'Raporlar', icon: <Flag className="w-4 h-4" />, count: stats?.pendingReports },
    { id: 'logs', label: 'Aktivite Logları', icon: <Activity className="w-4 h-4" /> },
    { id: 'settings', label: 'Güvenlik', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-[200] px-6 py-3 bg-green-500 text-white rounded-xl shadow-lg font-semibold flex items-center gap-2 animate-in">
          <CheckCircle className="w-4 h-4" />
          {notification}
        </div>
      )}

      {/* Ban Modal */}
      {banModalUser && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-slate-800 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Kullanıcıyı Yasakla</h3>
                <p className="text-slate-500 text-sm">{banModalUser.displayName} (@{banModalUser.username})</p>
              </div>
            </div>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Yasaklama sebebi (zorunlu)..."
              rows={3}
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setBanModalUser(null); setBanReason(''); }}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
              >
                İptal
              </button>
              <button
                onClick={handleBanUser}
                disabled={!banReason.trim()}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition"
              >
                Yasakla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="flex h-screen">
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col fixed h-full z-10">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Admin Panel</p>
                <p className="text-slate-400 text-xs">ProjeAkademi</p>
              </div>
            </div>
            <div className="mt-3 p-2.5 bg-slate-700/50 rounded-xl">
              <p className="text-xs text-slate-400">Giriş yapan:</p>
              <p className="text-sm font-semibold text-white">{adminUser?.displayName}</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {tab.icon}
                  {tab.label}
                </span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-600 text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Back Button */}
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={onBack}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl text-sm font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Siteye Dön
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 overflow-y-auto">
          {/* Top Bar */}
          <div className="sticky top-0 z-10 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white capitalize">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h1>
              <p className="text-slate-400 text-xs">Yönetim Paneli</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadAll}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                title="Yenile"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {activeTab !== 'dashboard' && activeTab !== 'logs' && activeTab !== 'settings' && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ara..."
                    className="pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* ===== DASHBOARD ===== */}
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Toplam Kullanıcı', value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500', sub: `${stats.activeUsers} aktif` },
                    { label: 'Yasaklı Hesap', value: stats.bannedUsers, icon: <Ban className="w-5 h-5" />, color: 'from-red-500 to-orange-500', sub: 'toplam ban' },
                    { label: 'Toplam Proje', value: stats.totalProjects, icon: <FolderOpen className="w-5 h-5" />, color: 'from-purple-500 to-indigo-500', sub: `${stats.newProjectsToday} bugün` },
                    { label: 'Toplam Blog', value: stats.totalBlogs, icon: <BookOpen className="w-5 h-5" />, color: 'from-green-500 to-teal-500', sub: 'yayında' },
                    { label: 'Bekleyen Rapor', value: stats.pendingReports, icon: <AlertTriangle className="w-5 h-5" />, color: 'from-yellow-500 to-orange-500', sub: `${stats.totalReports} toplam` },
                    { label: 'Bugün Kayıt', value: stats.newUsersToday, icon: <TrendingUp className="w-5 h-5" />, color: 'from-pink-500 to-rose-500', sub: 'yeni kullanıcı' },
                    { label: 'Admin Sayısı', value: stats.adminUsers, icon: <Shield className="w-5 h-5" />, color: 'from-slate-500 to-slate-700', sub: `${stats.moderatorUsers} moderatör` },
                    { label: 'Kaldırılan İçerik', value: stats.removedProjects + stats.removedBlogs, icon: <Trash2 className="w-5 h-5" />, color: 'from-gray-500 to-slate-600', sub: 'proje + blog' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                        {stat.icon}
                      </div>
                      <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
                      <p className="text-slate-400 text-xs font-medium">{stat.label}</p>
                      <p className="text-slate-500 text-xs">{stat.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Son Aktiviteler
                  </h3>
                  <div className="space-y-3">
                    {getActivityLogs().slice(0, 8).map((log) => (
                      <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.success ? 'bg-green-400' : 'bg-red-400'}`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-indigo-400">{log.action}</span>
                          <span className="text-xs text-slate-400 ml-2">{log.details}</span>
                        </div>
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString('tr-TR')}
                        </span>
                      </div>
                    ))}
                    {getActivityLogs().length === 0 && (
                      <p className="text-slate-500 text-sm text-center py-4">Henüz aktivite yok</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===== USERS ===== */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm">{filteredUsers.length} kullanıcı</p>
                </div>
                {filteredUsers.map((u) => (
                  <div key={u.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {u.displayName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-white">{u.displayName}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${roleColors[u.role]}`}>
                              {roleLabels[u.role]}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[u.status]}`}>
                              {u.status === 'active' ? '✅ Aktif' : u.status === 'banned' ? '🚫 Banlı' : '⚠️ Askıda'}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm">@{u.username} · {u.email}</p>
                          {u.banReason && (
                            <p className="text-red-400 text-xs mt-1">🚫 Ban sebebi: {u.banReason}</p>
                          )}
                          <p className="text-slate-500 text-xs mt-1">
                            Kayıt: {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                            {u.lastLogin && ` · Son giriş: ${new Date(u.lastLogin).toLocaleDateString('tr-TR')}`}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      {u.id !== adminUser?.id && (
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                          {/* Role selector */}
                          <div className="relative">
                            <select
                              value={selectedUserRole[u.id] || u.role}
                              onChange={(e) => {
                                const newRole = e.target.value as 'user' | 'moderator' | 'admin';
                                setSelectedUserRole((prev) => ({ ...prev, [u.id]: newRole }));
                                handleChangeRole(u.id, newRole);
                              }}
                              className="appearance-none px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-7 cursor-pointer"
                            >
                              <option value="user">👤 Kullanıcı</option>
                              <option value="moderator">⚡ Moderatör</option>
                              <option value="admin">🛡️ Admin</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                          </div>

                          {/* Ban/Unban */}
                          {u.status === 'banned' ? (
                            <button
                              onClick={() => handleUnbanUser(u.id)}
                              className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg text-xs font-semibold hover:bg-green-500/20 transition flex items-center gap-1"
                            >
                              <Unlock className="w-3 h-3" />
                              Ban Kaldır
                            </button>
                          ) : (
                            <button
                              onClick={() => setBanModalUser(u)}
                              className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition flex items-center gap-1"
                            >
                              <Ban className="w-3 h-3" />
                              Yasakla
                            </button>
                          )}
                        </div>
                      )}
                      {u.id === adminUser?.id && (
                        <span className="text-xs text-slate-500 italic">Siz</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== PROJECTS ===== */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                <p className="text-slate-400 text-sm">{filteredProjects.length} proje</p>
                {filteredProjects.map((p) => {
                  const owner = users.find((u) => u.id === p.userId);
                  return (
                    <div key={p.id} className={`bg-slate-800 border rounded-2xl p-5 ${p.status === 'removed' ? 'border-red-900/50 opacity-60' : 'border-slate-700'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-white">{p.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[p.status] || 'bg-slate-100 text-slate-600'}`}>
                              {p.status === 'active' ? '✅ Aktif' : p.status === 'removed' ? '🗑️ Kaldırıldı' : '👁️ Gizli'}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm line-clamp-2 mb-2">{p.description}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>👤 {owner?.displayName || 'Bilinmiyor'}</span>
                            <span>📅 {new Date(p.createdAt).toLocaleDateString('tr-TR')}</span>
                            <span>❤️ {p.likes}</span>
                            <span className="capitalize">📁 {p.category}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {p.status === 'removed' ? (
                            <button
                              onClick={() => handleRestoreProject(p.id)}
                              className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg text-xs font-semibold hover:bg-green-500/20 transition"
                            >
                              Geri Yükle
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteProject(p.id)}
                              className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Kaldır
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ===== BLOGS ===== */}
            {activeTab === 'blogs' && (
              <div className="space-y-4">
                <p className="text-slate-400 text-sm">{filteredBlogs.length} blog</p>
                {filteredBlogs.map((b) => {
                  const owner = users.find((u) => u.id === b.userId);
                  return (
                    <div key={b.id} className={`bg-slate-800 border rounded-2xl p-5 ${b.status === 'removed' ? 'border-red-900/50 opacity-60' : 'border-slate-700'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-white">{b.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[b.status] || 'bg-slate-100 text-slate-600'}`}>
                              {b.status === 'active' ? '✅ Aktif' : b.status === 'removed' ? '🗑️ Kaldırıldı' : '👁️ Gizli'}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm line-clamp-2 mb-2">{b.excerpt}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>👤 {owner?.displayName || 'Bilinmiyor'}</span>
                            <span>📅 {new Date(b.createdAt).toLocaleDateString('tr-TR')}</span>
                            <span>❤️ {b.likes}</span>
                            <span>👁️ {b.views}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {b.status === 'removed' ? (
                            <button
                              onClick={() => handleRestoreBlog(b.id)}
                              className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg text-xs font-semibold hover:bg-green-500/20 transition"
                            >
                              Geri Yükle
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteBlog(b.id)}
                              className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Kaldır
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ===== REPORTS ===== */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                <p className="text-slate-400 text-sm">{reports.length} rapor · {reports.filter(r => r.status === 'pending').length} bekliyor</p>
                {reports.length === 0 && (
                  <div className="text-center py-16 text-slate-500">
                    <Flag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Henüz rapor yok</p>
                  </div>
                )}
                {reports.map((r) => {
                  const reporter = users.find((u) => u.id === r.reporterId);
                  return (
                    <div key={r.id} className={`bg-slate-800 border rounded-2xl p-5 ${
                      r.status === 'pending' ? 'border-yellow-500/30' :
                      r.status === 'resolved' ? 'border-green-500/30' : 'border-slate-700'
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              r.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                              r.status === 'resolved' ? 'bg-green-500/10 text-green-400' :
                              'bg-slate-500/10 text-slate-400'
                            }`}>
                              {r.status === 'pending' ? '⏳ Bekliyor' : r.status === 'resolved' ? '✅ Çözüldü' : '❌ Reddedildi'}
                            </span>
                            <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">
                              {r.targetType === 'project' ? '📁 Proje' : r.targetType === 'blog' ? '📝 Blog' : '👤 Kullanıcı'}
                            </span>
                          </div>
                          <p className="font-semibold text-white text-sm">{r.reason}</p>
                          {r.details && <p className="text-slate-400 text-xs mt-1">{r.details}</p>}
                          <p className="text-slate-500 text-xs mt-2">
                            Raporlayan: {reporter?.displayName || 'Bilinmiyor'} · {new Date(r.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        {r.status === 'pending' && (
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleResolveReport(r.id, 'resolved')}
                              className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg text-xs font-semibold hover:bg-green-500/20 transition"
                            >
                              Çöz
                            </button>
                            <button
                              onClick={() => handleResolveReport(r.id, 'dismissed')}
                              className="px-3 py-1.5 bg-slate-600 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-500 transition"
                            >
                              Reddet
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ===== ACTIVITY LOGS ===== */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-sm">{logs.length} log kaydı</p>
                  <button
                    onClick={() => { clearActivityLogs(); loadAll(); notify('Loglar temizlendi.'); }}
                    className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-sm font-semibold hover:bg-red-500/20 transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Logları Temizle
                  </button>
                </div>
                <div className="space-y-2">
                  {logs.slice(0, 100).map((log) => (
                    <div key={log.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.success ? 'bg-green-400' : 'bg-red-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-indigo-400">{log.action}</span>
                          {log.userId && (
                            <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">
                              uid: {log.userId.slice(0, 10)}...
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded ${log.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {log.success ? '✓ Başarılı' : '✗ Başarısız'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">{log.details}</p>
                      </div>
                      <span className="text-xs text-slate-500 flex-shrink-0">
                        {new Date(log.timestamp).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Henüz aktivite logu yok</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== SECURITY SETTINGS ===== */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-400" />
                    Güvenlik Özellikleri
                  </h3>
                  <div className="space-y-4">
                    {[
                      { icon: '🔐', label: 'Şifre Hash\'leme', desc: 'Tüm şifreler bcrypt benzeri algoritma ile hashlenerek saklanır', status: true },
                      { icon: '🛡️', label: 'Rate Limiting', desc: '5 başarısız giriş denemesinden sonra hesap otomatik kilitlenir', status: true },
                      { icon: '🔑', label: 'Session Token', desc: 'Her giriş için benzersiz 64 karakter session token oluşturulur', status: true },
                      { icon: '⏰', label: 'Session Süresi', desc: 'Session tokenlar 7 gün sonra otomatik geçersiz olur', status: true },
                      { icon: '🧹', label: 'Input Sanitization', desc: 'Tüm kullanıcı girdileri XSS saldırılarına karşı temizlenir', status: true },
                      { icon: '✉️', label: 'Email Doğrulama', desc: 'Regex tabanlı email format doğrulaması', status: true },
                      { icon: '💪', label: 'Şifre Güç Kontrolü', desc: 'Kayıt sırasında şifre güç skoru hesaplanır (min. "Orta" seviye)', status: true },
                      { icon: '📝', label: 'Aktivite Logları', desc: 'Tüm giriş/çıkış ve admin işlemleri loglanır', status: true },
                      { icon: '🚫', label: 'Ban Sistemi', desc: 'Adminler kullanıcıları gerekçe ile yasaklayabilir', status: true },
                      { icon: '👁️', label: 'İçerik Moderasyonu', desc: 'Kaldırılan içerikler "removed" statüsüne alınır, silinmez', status: true },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-xl">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white text-sm">{item.label}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${item.status ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              {item.status ? '✅ Aktif' : '❌ Kapalı'}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Storage Info */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-400" />
                    Veri Deposu
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'projeakademi_users', label: 'Kullanıcılar' },
                      { key: 'projeakademi_projects', label: 'Projeler' },
                      { key: 'projeakademi_blogs', label: 'Bloglar' },
                      { key: 'projeakademi_reports', label: 'Raporlar' },
                      { key: 'pa_activity_log', label: 'Aktivite Logları' },
                      { key: 'pa_rate_limits', label: 'Rate Limit Kayıtları' },
                    ].map((item) => {
                      const data = localStorage.getItem(item.key);
                      const size = data ? new Blob([data]).size : 0;
                      return (
                        <div key={item.key} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                          <span className="text-sm text-slate-300">{item.label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 font-mono">{item.key}</span>
                            <span className="text-xs text-indigo-400 font-bold">
                              {size > 1024 ? `${(size / 1024).toFixed(1)} KB` : `${size} B`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
