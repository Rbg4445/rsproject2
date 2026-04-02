import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save, RotateCcw, Type, Link2, Palette, Shield, Users, FileText, Ban, Trash2, Undo2, Search, CheckCircle, XCircle, Clock, Eye, EyeOff, Video, Tag, BookOpen, Code, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
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
  type FirestoreArticle,
  addAccessLog,
  blockIp,
  getAccessLogs,
  getAllUsers,
  getBlogsAdmin,
  getBlockedIps,
  getContactMessages,
  getProjectsAdmin,
  getArticles,
  setContactMessageStatus,
  setBlogStatus,
  setProjectStatus,
  setArticleStatus,
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

// ─── ContentManager bileşeni ─────────────────────────────────────────────────
type ContentStatus = 'active' | 'pending' | 'removed';
type ContentTab = 'projects' | 'blogs' | 'articles';

function StatusBadge({ status }: { status: ContentStatus }) {
  const map: Record<ContentStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    active:  { label: 'Aktif',    cls: 'bg-green-500/15 text-green-300 border-green-500/30',   icon: <CheckCircle className="h-3 w-3" /> },
    pending: { label: 'Bekliyor', cls: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', icon: <Clock className="h-3 w-3" /> },
    removed: { label: 'Kaldirildi', cls: 'bg-red-500/15 text-red-300 border-red-500/30',       icon: <XCircle className="h-3 w-3" /> },
  };
  const { label, cls, icon } = map[status] ?? map.removed;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {icon}{label}
    </span>
  );
}

function ContentManager({
  projects, blogs, articles, onRefresh, userEmail,
}: {
  projects: FirestoreProject[];
  blogs: FirestoreBlog[];
  articles: FirestoreArticle[];
  onRefresh: () => Promise<void>;
  userEmail: string;
}) {
  const [tab, setTab] = useState<ContentTab>('projects');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ContentStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ name: string; dataUrl: string } | null>(null);

  const tabs: { id: ContentTab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'projects', label: 'Projeler',     icon: <Code className="h-4 w-4" />,     count: projects.length },
    { id: 'blogs',    label: 'Bloglar',      icon: <FileText className="h-4 w-4" />, count: blogs.length },
    { id: 'articles', label: 'Wiki/Makale',  icon: <BookOpen className="h-4 w-4" />, count: articles.length },
  ];

  const items: any[] = tab === 'projects' ? projects : tab === 'blogs' ? blogs : articles;

  const filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.username?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:   items.length,
    active:  items.filter((i) => i.status === 'active').length,
    pending: items.filter((i) => i.status === 'pending').length,
    removed: items.filter((i) => i.status === 'removed').length,
  };

  const setStatus = async (id: string, newStatus: ContentStatus) => {
    setBusy(id);
    try {
      if (tab === 'projects') await setProjectStatus(id, newStatus);
      else if (tab === 'blogs') await setBlogStatus(id, newStatus);
      else await setArticleStatus(id, newStatus);
      await onRefresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Sekme Seçici */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setExpandedId(null); setSearch(''); }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border transition ${
              tab === t.id
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            {t.icon}
            {t.label}
            <span className={`rounded-full px-1.5 py-0.5 text-xs ${
              tab === t.id ? 'bg-white/20' : 'bg-white/10'
            }`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Toplam',      value: stats.total,   color: 'text-white',        bg: 'bg-white/5',           border: 'border-white/10' },
          { label: 'Aktif',       value: stats.active,  color: 'text-green-300',    bg: 'bg-green-500/8',       border: 'border-green-500/20' },
          { label: 'Bekleyen',    value: stats.pending, color: 'text-yellow-300',   bg: 'bg-yellow-500/8',      border: 'border-yellow-500/20' },
          { label: 'Kaldirilmis', value: stats.removed, color: 'text-red-300',      bg: 'bg-red-500/8',         border: 'border-red-500/20' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-3`}>
            <p className="text-xs text-white/50">{s.label}</p>
            <p className={`mt-1 text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Arama + Filtre */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Başlık, kullanıcı veya açıklama ara..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'active', 'removed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold border transition ${
                filterStatus === s
                  ? s === 'all'     ? 'bg-indigo-600 border-indigo-500 text-white'
                  : s === 'active'  ? 'bg-green-600 border-green-500 text-white'
                  : s === 'pending' ? 'bg-yellow-600 border-yellow-500 text-white'
                                    : 'bg-red-600 border-red-500 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {s === 'all' ? 'Tümü' : s === 'active' ? 'Aktif' : s === 'pending' ? 'Bekleyen' : 'Kaldırılan'}
            </button>
          ))}
        </div>
      </div>

      {/* İçerik Listesi */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-10 text-center">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-white/20" />
            <p className="text-sm text-white/40">Sonuç bulunamadı.</p>
          </div>
        )}
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;
          const isBusy = busy === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all ${
                item.status === 'pending'
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : item.status === 'removed'
                  ? 'border-red-500/20 bg-red-500/5'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              {/* Kart Başlığı */}
              <div className="flex items-start gap-3 p-4">
                {/* Kapak */}
                {item.image && (
                  <img src={item.image} alt="" className="h-14 w-20 flex-shrink-0 rounded-lg object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-white">{item.title}</p>
                    <StatusBadge status={item.status} />
                    {item.videoUrl && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-xs text-purple-300">
                        <Video className="h-3 w-3" /> Video
                      </span>
                    )}
                    {tab === 'projects' && item.documents?.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300">
                        <FileText className="h-3 w-3" /> {item.documents.length} belge
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/50">
                    <span>@{item.username}</span>
                    {item.category && <span className="capitalize">{item.category}</span>}
                    {item.difficulty && <span>{item.difficulty}</span>}
                    {item.createdAt && (
                      <span>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                    )}
                    {item.likes !== undefined && (
                      <span>❤️ {item.likes}</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="mt-1.5 text-xs text-white/60 line-clamp-2">{item.description}</p>
                  )}
                  {/* Etiketler */}
                  {item.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.slice(0, 5).map((tag: string) => (
                        <span key={tag} className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-white/50">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Detay aç/kapat */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex-shrink-0 rounded-lg border border-white/10 p-1.5 text-white/40 hover:bg-white/10"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>

              {/* Genişletilmiş Detay */}
              {isExpanded && (
                <div className="border-t border-white/10 px-4 pb-4 pt-3 space-y-3">
                  {/* Belgeler */}
                  {tab === 'projects' && item.documents?.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        Yüklenen Belgeler ({item.documents.length})
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {item.documents.map((doc: { id: string; name: string; dataUrl: string }) => {
                          const ext = doc.name.split('.').pop()?.toLowerCase() ?? '';
                          const isPdf = ext === 'pdf';
                          const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
                          return (
                            <div key={doc.id} className="flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/8 p-2.5">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                                {isPdf ? '📄' : isImage ? '🖼️' : '📎'}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-white/80">{doc.name}</p>
                                <p className="text-[10px] text-white/40 uppercase">{ext}</p>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => setPreviewDoc({ name: doc.name, dataUrl: doc.dataUrl })}
                                  className="rounded-lg bg-indigo-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-indigo-500"
                                  title="Önizle"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                                <a
                                  href={doc.dataUrl}
                                  download={doc.name}
                                  className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold text-white hover:bg-white/20"
                                  title="İndir"
                                >
                                  ⬇
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {item.content && (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/40">İçerik Önizleme</p>
                      <p className="rounded-xl bg-black/20 px-3 py-2 text-xs text-white/70 line-clamp-6">{item.content}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs text-white/60 sm:grid-cols-3">
                    {item.github && <a href={item.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-300 hover:underline">🔗 GitHub</a>}
                    {item.demo   && <a href={item.demo}   target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-300 hover:underline">🌐 Demo</a>}
                    {item.videoUrl && <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-purple-300 hover:underline">🎬 Video</a>}
                  </div>
                </div>
              )}

              {/* Aksiyon Butonları */}
              <div className="flex flex-wrap items-center gap-2 border-t border-white/8 px-4 py-3">
                {item.status !== 'active' && (
                  <button
                    onClick={() => void setStatus(item.id, 'active')}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-500 disabled:opacity-50"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Onayla / Yayınla
                  </button>
                )}
                {item.status !== 'pending' && (
                  <button
                    onClick={() => void setStatus(item.id, 'pending')}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-600/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-yellow-500 disabled:opacity-50"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Bekleyene Al
                  </button>
                )}
                {item.status !== 'removed' && (
                  <button
                    onClick={() => void setStatus(item.id, 'removed')}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Kaldır
                  </button>
                )}
                {item.status === 'removed' && (
                  <button
                    onClick={() => void setStatus(item.id, 'active')}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10 disabled:opacity-50"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    Geri Yükle
                  </button>
                )}
                {isBusy && <span className="text-xs text-white/40">İşleniyor...</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Belge Önizleme Modali */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Başlık */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/10 bg-gray-800/80">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                <p className="text-sm font-semibold text-white truncate">{previewDoc.name}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={previewDoc.dataUrl}
                  download={previewDoc.name}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  ⬇ İndir
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
                >
                  ✕ Kapat
                </button>
              </div>
            </div>
            {/* Modal İçerik */}
            <div className="flex-1 overflow-auto">
              {(() => {
                const ext = previewDoc.name.split('.').pop()?.toLowerCase() ?? '';
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
                const isPdf  = ext === 'pdf';
                if (isImage) {
                  return (
                    <div className="flex items-center justify-center p-4 min-h-[400px]">
                      <img src={previewDoc.dataUrl} alt={previewDoc.name} className="max-w-full max-h-[70vh] rounded-lg object-contain" />
                    </div>
                  );
                }
                if (isPdf) {
                  return (
                    <iframe
                      src={previewDoc.dataUrl}
                      title={previewDoc.name}
                      className="w-full min-h-[70vh]"
                    />
                  );
                }
                return (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-5xl mb-4">📂</div>
                    <p className="text-white/60 text-sm mb-4">Bu dosya türü tarayıcıda görüntülenemiyor.</p>
                    <a
                      href={previewDoc.dataUrl}
                      download={previewDoc.name}
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-500"
                    >
                      ⬇ Dosyayı İndir
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [articles, setArticles] = useState<FirestoreArticle[]>([]);
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
    const [allUsers, allProjects, allBlogs, allArticles, logs, blocked, contactMessages] = await Promise.all([
      getAllUsers(),
      getProjectsAdmin(),
      getBlogsAdmin(),
      getArticles(),
      getAccessLogs(),
      getBlockedIps(),
      getContactMessages(),
    ]);
    setUsers(allUsers);
    setProjects(allProjects);
    setBlogs(allBlogs);
    setArticles(allArticles);
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

          {activeTab === 'content' && (() => {
            // ─── İçerik Yönetimi State ───────────────────────────────────────
            return <ContentManager
              projects={projects}
              blogs={blogs}
              articles={articles}
              onRefresh={refreshAdminData}
              userEmail={userProfile?.email || 'admin'}
            />;
          })()}

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