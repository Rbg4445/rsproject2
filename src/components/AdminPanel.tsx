import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save, RotateCcw, Type, Link2, Palette, Shield, Users, FileText, Ban, Trash2, Undo2 } from 'lucide-react';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import { useSiteSettings, type SiteSettings } from '../store/SiteSettingsContext';
import { useTheme, type ThemeMode } from '../store/ThemeContext';
import {
  type AccessLog,
  type BlockedIp,
  type ContactMessage,
  type FirestoreBlog,
  type FirestoreProject,
  type FirestoreUser,
  addAccessLog,
  blockIp,
  getAccessLogs,
  getAllUsers,
  getBlogsAdmin,
  getBlockedIps,
  getContactMessages,
  getProjectsAdmin,
  setContactMessageStatus,
  setBlogStatus,
  setProjectStatus,
  setUserBan,
  setUserRole,
  unblockIp,
} from '../firebase/firestoreService';

interface AdminPanelProps {
  onBack: () => void;
}

type AdminTab = 'texts' | 'links' | 'appearance' | 'users' | 'content' | 'messages' | 'security';

const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'texts', label: 'Yazilar', icon: <Type className="h-4 w-4" /> },
  { id: 'links', label: 'Linkler', icon: <Link2 className="h-4 w-4" /> },
  { id: 'appearance', label: 'Tema', icon: <Palette className="h-4 w-4" /> },
  { id: 'users', label: 'Kullanicilar', icon: <Users className="h-4 w-4" /> },
  { id: 'content', label: 'Icerik', icon: <FileText className="h-4 w-4" /> },
  { id: 'messages', label: 'Mesajlar', icon: <FileText className="h-4 w-4" /> },
  { id: 'security', label: 'Guvenlik', icon: <Shield className="h-4 w-4" /> },
];

const iconUrls = {
  user: 'https://cdn-icons-png.flaticon.com/128/847/847969.png',
  content: 'https://cdn-icons-png.flaticon.com/128/2921/2921222.png',
  security: 'https://cdn-icons-png.flaticon.com/128/3064/3064197.png',
  theme: 'https://cdn-icons-png.flaticon.com/128/869/869869.png',
  link: 'https://cdn-icons-png.flaticon.com/128/1006/1006771.png',
};

function Field({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-white/60">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
        />
      )}
    </label>
  );
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { isAdmin, userProfile } = useFirebaseAuth();
  const { settings, updateSettings, resetSettings } = useSiteSettings();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('texts');
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [flash, setFlash] = useState('');

  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [projects, setProjects] = useState<FirestoreProject[]>([]);
  const [blogs, setBlogs] = useState<FirestoreBlog[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [blockedIps, setBlockedIps] = useState<BlockedIp[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [newIp, setNewIp] = useState('');
  const [newIpReason, setNewIpReason] = useState('Supheli trafik');

  const changed = useMemo(() => JSON.stringify(draft) !== JSON.stringify(settings), [draft, settings]);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  useEffect(() => {
    if (!isAdmin) return;
    void refreshAdminData();
  }, [isAdmin]);

  async function refreshAdminData() {
    const [allUsers, allProjects, allBlogs, logs, blocked, contactMessages] = await Promise.all([
      getAllUsers(),
      getProjectsAdmin(),
      getBlogsAdmin(),
      getAccessLogs(),
      getBlockedIps(),
      getContactMessages(),
    ]);
    setUsers(allUsers);
    setProjects(allProjects);
    setBlogs(allBlogs);
    setAccessLogs(logs);
    setBlockedIps(blocked);
    setMessages(contactMessages);
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 px-6 py-24 text-center text-white">
        <h2 className="text-2xl font-bold">Admin Yetkisi Gerekli</h2>
        <p className="mt-2 text-white/60">Bu sayfayi sadece admin hesaplari kullanabilir.</p>
        <button onClick={onBack} className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
          Geri Don
        </button>
      </div>
    );
  }

  const saveChanges = () => {
    updateSettings(draft);
    setFlash('Ayarlar kaydedildi.');
    setTimeout(() => setFlash(''), 2200);
  };

  const resetAll = () => {
    resetSettings();
    setDraft(settings);
    setFlash('Varsayilan ayarlar yuklendi.');
    setTimeout(() => setFlash(''), 2200);
  };

  const applyUserRole = async (uid: string, role: FirestoreUser['role']) => {
    await setUserRole(uid, role);
    await addAccessLog({
      uid: userProfile?.uid,
      email: userProfile?.email,
      action: 'LOGIN_SUCCESS',
      ip: 'admin-panel',
      userAgent: 'admin-action',
      success: true,
      reason: `Role changed for ${uid} -> ${role}`,
    });
    await refreshAdminData();
  };

  const toggleBan = async (u: FirestoreUser) => {
    if (u.role === 'admin') return;
    if (u.isBanned) {
      await setUserBan(u.uid, false);
    } else {
      const reason = prompt('Ban sebebi:') || 'Kural ihlali';
      await setUserBan(u.uid, true, reason);
    }
    await refreshAdminData();
  };

  const toggleProjectVisibility = async (p: FirestoreProject) => {
    await setProjectStatus(p.id, p.status === 'active' ? 'removed' : 'active');
    await refreshAdminData();
  };

  const toggleBlogVisibility = async (b: FirestoreBlog) => {
    await setBlogStatus(b.id, b.status === 'active' ? 'removed' : 'active');
    await refreshAdminData();
  };

  const addBlockedIp = async () => {
    if (!newIp.trim()) return;
    await blockIp(newIp.trim(), newIpReason.trim() || 'Supheli trafik', userProfile?.email || 'admin');
    setNewIp('');
    setNewIpReason('Supheli trafik');
    await refreshAdminData();
  };

  const updateMessageStatus = async (id: string, status: ContactMessage['status']) => {
    await setContactMessageStatus(id, status);
    await refreshAdminData();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-24 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">Admin Panel</h1>
            <p className="text-sm text-white/50">Hosgeldin, {userProfile?.displayName}</p>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Siteye Don
          </button>
        </div>

        {flash && <div className="mb-4 rounded-xl bg-green-500/15 px-4 py-3 text-sm text-green-300">{flash}</div>}

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-gray-900/70 p-5 sm:p-6">
          {activeTab === 'texts' && (
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm text-white/60">
                <img src={iconUrls.content} alt="content" className="h-5 w-5 rounded-sm" />
                Site yazi alanlarini buradan yonet.
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Marka Adi" value={draft.brandName} onChange={(v) => setDraft((p) => ({ ...p, brandName: v }))} />
                <Field label="Marka Alt Basligi" value={draft.brandSubline} onChange={(v) => setDraft((p) => ({ ...p, brandSubline: v }))} />
                <Field label="Hero Rozet" value={draft.heroBadge} onChange={(v) => setDraft((p) => ({ ...p, heroBadge: v }))} />
                <Field label="Hero Baslik" value={draft.heroTitle} onChange={(v) => setDraft((p) => ({ ...p, heroTitle: v }))} />
                <div className="sm:col-span-2">
                  <Field label="Hero Aciklama" value={draft.heroSubtitle} onChange={(v) => setDraft((p) => ({ ...p, heroSubtitle: v }))} textarea />
                </div>
                <div className="sm:col-span-2">
                  <Field label="Beta Satiri" value={draft.betaLine} onChange={(v) => setDraft((p) => ({ ...p, betaLine: v }))} />
                </div>
                <Field label="Hakkimda Baslik" value={draft.aboutTitle} onChange={(v) => setDraft((p) => ({ ...p, aboutTitle: v }))} />
                <div className="sm:col-span-2">
                  <Field label="Hakkimda Aciklama" value={draft.aboutDescription} onChange={(v) => setDraft((p) => ({ ...p, aboutDescription: v }))} textarea />
                </div>
                <Field label="Footer Notu" value={draft.footerNote} onChange={(v) => setDraft((p) => ({ ...p, footerNote: v }))} />
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm text-white/60">
                <img src={iconUrls.link} alt="links" className="h-5 w-5 rounded-sm" />
                Sosyal hesaplar ve iletisim bilgileri.
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Iletisim Email" value={draft.contactEmail} onChange={(v) => setDraft((p) => ({ ...p, contactEmail: v }))} />
                <Field label="Telefon" value={draft.contactPhone} onChange={(v) => setDraft((p) => ({ ...p, contactPhone: v }))} />
                <Field label="Konum" value={draft.contactLocation} onChange={(v) => setDraft((p) => ({ ...p, contactLocation: v }))} />
                <Field label="GitHub Linki" value={draft.githubUrl} onChange={(v) => setDraft((p) => ({ ...p, githubUrl: v }))} />
                <Field label="Twitter Linki" value={draft.twitterUrl} onChange={(v) => setDraft((p) => ({ ...p, twitterUrl: v }))} />
                <Field label="LinkedIn Linki" value={draft.linkedinUrl} onChange={(v) => setDraft((p) => ({ ...p, linkedinUrl: v }))} />
                <Field label="YouTube Linki" value={draft.youtubeUrl} onChange={(v) => setDraft((p) => ({ ...p, youtubeUrl: v }))} />
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <img src={iconUrls.theme} alt="theme" className="h-5 w-5 rounded-sm" />
                Tema secimini aninda uygula.
              </div>
              <div className="flex gap-3">
                {(['dark', 'light'] as ThemeMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTheme(mode)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      theme === mode ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/70'
                    }`}
                  >
                    {mode === 'dark' ? 'Karanlik Mod' : 'Aydinlik Mod'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <img src={iconUrls.user} alt="users" className="h-5 w-5 rounded-sm" />
                Kullanici rol degisikligi, ban ve acma islemleri.
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/5 text-left text-white/60">
                    <tr>
                      <th className="px-4 py-3">Kullanici</th>
                      <th className="px-4 py-3">Rol</th>
                      <th className="px-4 py-3">Durum</th>
                      <th className="px-4 py-3">Islem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.uid} className="border-t border-white/10">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-white">{u.displayName}</p>
                          <p className="text-xs text-white/50">{u.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            onChange={(e) => void applyUserRole(u.uid, e.target.value as FirestoreUser['role'])}
                            className="rounded-lg border border-white/10 bg-gray-800 px-2 py-1 text-xs"
                            disabled={u.uid === userProfile?.uid}
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {u.isBanned ? (
                            <span className="rounded-full bg-red-500/15 px-2 py-1 text-red-300">Banli</span>
                          ) : (
                            <span className="rounded-full bg-green-500/15 px-2 py-1 text-green-300">Aktif</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => void toggleBan(u)}
                            disabled={u.uid === userProfile?.uid || u.role === 'admin'}
                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                              u.isBanned
                                ? 'bg-green-500/15 text-green-300'
                                : 'bg-red-500/15 text-red-300'
                            } disabled:opacity-40`}
                          >
                            {u.isBanned ? <Undo2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                            {u.isBanned ? 'Ban Kaldir' : 'Banla'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 font-bold">Projeler</h3>
                <div className="max-h-[26rem] space-y-2 overflow-auto pr-1">
                  {projects.map((p) => (
                    <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-sm font-semibold text-white">{p.title}</p>
                      <p className="text-xs text-white/50">@{p.username}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`rounded-full px-2 py-1 text-xs ${p.status === 'active' ? 'bg-green-500/15 text-green-300' : 'bg-red-500/15 text-red-300'}`}>
                          {p.status}
                        </span>
                        <button
                          onClick={() => void toggleProjectVisibility(p)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs"
                        >
                          {p.status === 'active' ? <Trash2 className="h-3.5 w-3.5" /> : <Undo2 className="h-3.5 w-3.5" />}
                          {p.status === 'active' ? 'Kaldir' : 'Geri Al'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-bold">Bloglar</h3>
                <div className="max-h-[26rem] space-y-2 overflow-auto pr-1">
                  {blogs.map((b) => (
                    <div key={b.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-sm font-semibold text-white">{b.title}</p>
                      <p className="text-xs text-white/50">@{b.username}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`rounded-full px-2 py-1 text-xs ${b.status === 'active' ? 'bg-green-500/15 text-green-300' : 'bg-red-500/15 text-red-300'}`}>
                          {b.status}
                        </span>
                        <button
                          onClick={() => void toggleBlogVisibility(b)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs"
                        >
                          {b.status === 'active' ? <Trash2 className="h-3.5 w-3.5" /> : <Undo2 className="h-3.5 w-3.5" />}
                          {b.status === 'active' ? 'Kaldir' : 'Geri Al'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-white/60">
                  <img src={iconUrls.security} alt="security" className="h-5 w-5 rounded-sm" />
                  Giris-cikis IP loglari ve IP banlama.
                </div>

                <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    placeholder="IP adresi (ornek: 85.100.22.10)"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  />
                  <input
                    value={newIpReason}
                    onChange={(e) => setNewIpReason(e.target.value)}
                    placeholder="Ban sebebi"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  />
                  <button onClick={() => void addBlockedIp()} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold">
                    IP Banla
                  </button>
                </div>

                <div className="mb-6 overflow-x-auto rounded-xl border border-white/10">
                  <table className="min-w-full text-sm">
                    <thead className="bg-white/5 text-left text-white/60">
                      <tr>
                        <th className="px-4 py-3">Banli IP</th>
                        <th className="px-4 py-3">Sebep</th>
                        <th className="px-4 py-3">Tarih</th>
                        <th className="px-4 py-3">Islem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blockedIps.map((entry) => (
                        <tr key={entry.id} className="border-t border-white/10">
                          <td className="px-4 py-3 font-mono text-xs text-white">{entry.ip}</td>
                          <td className="px-4 py-3 text-xs text-white/70">{entry.reason}</td>
                          <td className="px-4 py-3 text-xs text-white/50">{new Date(entry.createdAt).toLocaleString('tr-TR')}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => void unblockIp(entry.ip).then(refreshAdminData)}
                              className="rounded-lg bg-green-500/15 px-2 py-1 text-xs font-semibold text-green-300"
                            >
                              Ban Kaldir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="min-w-full text-sm">
                    <thead className="bg-white/5 text-left text-white/60">
                      <tr>
                        <th className="px-4 py-3">Tarih</th>
                        <th className="px-4 py-3">Aksiyon</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">IP</th>
                        <th className="px-4 py-3">User-Agent</th>
                        <th className="px-4 py-3">Durum</th>
                        <th className="px-4 py-3">Detay</th>
                        <th className="px-4 py-3">IP Islem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accessLogs.slice(0, 80).map((log) => (
                        <tr key={log.id} className="border-t border-white/10">
                          <td className="px-4 py-3 text-xs text-white/50">{new Date(log.timestamp).toLocaleString('tr-TR')}</td>
                          <td className="px-4 py-3 text-xs text-white">{log.action}</td>
                          <td className="px-4 py-3 text-xs text-white/70">{log.email || '-'}</td>
                          <td className="px-4 py-3 font-mono text-xs text-indigo-300">{log.ip}</td>
                          <td className="max-w-[15rem] truncate px-4 py-3 text-xs text-white/40" title={log.userAgent}>{log.userAgent}</td>
                          <td className="px-4 py-3 text-xs">
                            {log.success ? (
                              <span className="rounded-full bg-green-500/15 px-2 py-1 text-green-300">Basarili</span>
                            ) : (
                              <span className="rounded-full bg-red-500/15 px-2 py-1 text-red-300">Basarisiz</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-white/50">{log.reason || '-'}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => void blockIp(log.ip, `Logdan engellendi: ${log.action}`, userProfile?.email || 'admin').then(refreshAdminData)}
                              className="rounded-lg bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-300"
                              disabled={log.ip === 'unknown' || blockedIps.some((entry) => entry.ip === log.ip)}
                            >
                              IP Banla
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <img src={iconUrls.content} alt="messages" className="h-5 w-5 rounded-sm" />
                Iletisim formundan gelen tum mesajlar.
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/5 text-left text-white/60">
                    <tr>
                      <th className="px-4 py-3">Tarih</th>
                      <th className="px-4 py-3">Gonderen</th>
                      <th className="px-4 py-3">Konu</th>
                      <th className="px-4 py-3">Mesaj</th>
                      <th className="px-4 py-3">IP</th>
                      <th className="px-4 py-3">Durum</th>
                      <th className="px-4 py-3">Islem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((msg) => (
                      <tr key={msg.id} className="border-t border-white/10 align-top">
                        <td className="px-4 py-3 text-xs text-white/50">{new Date(msg.createdAt).toLocaleString('tr-TR')}</td>
                        <td className="px-4 py-3 text-xs text-white">
                          <p className="font-semibold">{msg.name}</p>
                          <a href={`mailto:${msg.email}`} className="text-indigo-300 hover:underline">{msg.email}</a>
                        </td>
                        <td className="px-4 py-3 text-xs text-white/80">{msg.subject}</td>
                        <td className="max-w-[22rem] px-4 py-3 text-xs text-white/70">
                          <p className="line-clamp-4">{msg.message}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-indigo-300">{msg.ip}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className={`rounded-full px-2 py-1 ${
                            msg.status === 'new'
                              ? 'bg-yellow-500/15 text-yellow-300'
                              : msg.status === 'read'
                                ? 'bg-blue-500/15 text-blue-300'
                                : 'bg-green-500/15 text-green-300'
                          }`}>
                            {msg.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => void updateMessageStatus(msg.id, 'read')}
                              className="rounded-lg border border-white/10 px-2 py-1 text-xs"
                            >
                              Okundu
                            </button>
                            <button
                              onClick={() => void updateMessageStatus(msg.id, 'resolved')}
                              className="rounded-lg bg-green-500/15 px-2 py-1 text-xs text-green-300"
                            >
                              Cozuldu
                            </button>
                            <button
                              onClick={() => void blockIp(msg.ip, `Mesaj kaynagi engellendi: ${msg.subject}`, userProfile?.email || 'admin').then(refreshAdminData)}
                              className="rounded-lg bg-red-500/15 px-2 py-1 text-xs text-red-300"
                              disabled={msg.ip === 'unknown' || blockedIps.some((entry) => entry.ip === msg.ip)}
                            >
                              IP Banla
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {messages.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-white/40">
                          Henuz iletisim formu mesaji yok.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {(activeTab === 'texts' || activeTab === 'links') && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={saveChanges}
              disabled={!changed}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Kaydet
            </button>
            <button
              onClick={() => setDraft(settings)}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80"
            >
              Taslagi Sifirla
            </button>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300"
            >
              <RotateCcw className="h-4 w-4" />
              Varsayilana Don
            </button>
          </div>
        )}
      </div>
    </div>
  );
}