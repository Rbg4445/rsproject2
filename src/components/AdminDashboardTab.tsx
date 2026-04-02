import { useState } from 'react';
import {
  Users, FileText, MessageSquare, Clock, CheckCircle, Flag,
  Zap, AlertTriangle, BarChart, TrendingUp
} from 'lucide-react';
import {
  type FirestoreUser,
  type FirestoreProject,
  type FirestoreBlog,
  type FirestoreArticle,
  type ContactMessage,
  approveAllPending,
} from '../firebase/firestoreService';

interface Props {
  users: FirestoreUser[];
  projects: FirestoreProject[];
  blogs: FirestoreBlog[];
  articles: FirestoreArticle[];
  messages: ContactMessage[];
  userEmail: string;
  onRefresh: () => Promise<void>;
}

export default function DashboardTab({ users, projects, blogs, articles, messages, userEmail, onRefresh }: Props) {
  const [approving, setApproving] = useState(false);
  const [approveResult, setApproveResult] = useState(null as { projects: number; blogs: number; articles: number } | null);

  const pendingProjects  = projects.filter(p => p.status === 'pending').length;
  const pendingBlogs     = blogs.filter(b => b.status === 'pending').length;
  const pendingArticles  = articles.filter(a => a.status === 'pending').length;
  const totalPending     = pendingProjects + pendingBlogs + pendingArticles;
  const newMessages      = messages.filter(m => m.status === 'new').length;
  const bannedUsers      = users.filter(u => u.isBanned).length;

  const handleApproveAll = async () => {
    if (!window.confirm(`${totalPending} iç erik onaylanacak. Emin misiniz?`)) return;
    setApproving(true);
    try {
      const result = await approveAllPending();
      setApproveResult(result);
      await onRefresh();
      setTimeout(() => setApproveResult(null), 4000);
    } finally {
      setApproving(false);
    }
  };

  const stats = [
    { label: 'Toplam Kullanıcı', value: users.length, icon: <Users className="h-5 w-5" />, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Bekleyen İçerik', value: totalPending, icon: <Clock className="h-5 w-5" />, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Yeni Mesaj', value: newMessages, icon: <MessageSquare className="h-5 w-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Toplam Proje', value: projects.length, icon: <FileText className="h-5 w-5" />, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Toplam Blog', value: blogs.length, icon: <BarChart className="h-5 w-5" />, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Aktif İçerik', value: projects.filter(p=>p.status==='active').length + blogs.filter(b=>b.status==='active').length, icon: <CheckCircle className="h-5 w-5" />, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Banlı Kullanıcı', value: bannedUsers, icon: <Flag className="h-5 w-5" />, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Wiki Makaleler', value: articles.length, icon: <TrendingUp className="h-5 w-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Admin Özet Paneli</h2>
          <p className="text-sm text-white/40 mt-0.5">Platformun genel durumu</p>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
            <div className={`mb-2 ${s.color}`}>{s.icon}</div>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Platform Bar grafikleri */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2"><BarChart className="h-4 w-4 text-indigo-400" /> İçerik Dağılımı</h3>
        {[
          { label: 'Aktif Projeler', value: projects.filter(p=>p.status==='active').length, total: projects.length, color: 'bg-indigo-500' },
          { label: 'Aktif Bloglar',  value: blogs.filter(b=>b.status==='active').length,    total: blogs.length,    color: 'bg-purple-500' },
          { label: 'Aktif Makaleler', value: articles.filter(a=>a.status==='active').length, total: articles.length, color: 'bg-emerald-500' },
        ].map(row => (
          <div key={row.label}>
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span>{row.label}</span>
              <span>{row.value} / {row.total}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-700/50 overflow-hidden">
              <div
                className={`h-full rounded-full ${row.color} transition-all`}
                style={{ width: `${row.total > 0 ? (row.value / row.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Hızlı Eylemler */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-400" /> Hızlı Eylemler</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={handleApproveAll}
            disabled={approving || totalPending === 0}
            className="flex items-center gap-3 rounded-xl bg-green-600/20 border border-green-600/30 px-4 py-3 text-sm font-semibold text-green-300 hover:bg-green-600/30 transition disabled:opacity-40"
          >
            <CheckCircle className="h-5 w-5" />
            <div className="text-left">
              <p>Tümünü Onayla</p>
              <p className="text-xs text-green-400/60">{totalPending} bekleyen içerik</p>
            </div>
          </button>

          <div className="flex items-center gap-3 rounded-xl bg-blue-600/10 border border-blue-600/20 px-4 py-3 text-sm">
            <Users className="h-5 w-5 text-blue-400" />
            <div>
              <p className="font-semibold text-white">{users.filter(u=>!u.isBanned).length} Aktif Kullanıcı</p>
              <p className="text-xs text-white/40">{bannedUsers} banlı</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-yellow-600/10 border border-yellow-600/20 px-4 py-3 text-sm">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="font-semibold text-white">{newMessages} yeni mesaj</p>
              <p className="text-xs text-white/40">İletişim formundan</p>
            </div>
          </div>
        </div>

        {approveResult && (
          <div className="mt-3 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-300">
            ✅ Onaylandı: {approveResult.projects} proje, {approveResult.blogs} blog, {approveResult.articles} makale
          </div>
        )}
      </div>
    </div>
  );
}
