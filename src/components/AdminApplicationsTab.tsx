import { useEffect, useState } from 'react';
import { Shield, CheckCircle, X, Clock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import {
  type AdminApplication,
  getAdminApplications,
  reviewAdminApplication,
} from '../firebase/firestoreService';

interface Props { userEmail: string; }

export default function AdminApplicationsTab({ userEmail }: Props) {
  const [apps, setApps] = useState([] as AdminApplication[]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending' as AdminApplication['status'] | 'all');
  const [expandedId, setExpandedId] = useState(null as string | null);
  const [reviewNote, setReviewNote] = useState('');
  const [processing, setProcessing] = useState(null as string | null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setApps(await getAdminApplications());
    setLoading(false);
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !reviewNote.trim()) {
      alert('Reddetmek için bir açıklama yazın.');
      return;
    }
    const action = status === 'approved' ? 'onaylamak' : 'reddetmek';
    if (!window.confirm(`Bu başvuruyu ${action} istiyor musunuz?`)) return;
    setProcessing(id);
    await reviewAdminApplication(id, status, userEmail, reviewNote.trim() || undefined);
    setReviewNote('');
    setExpandedId(null);
    await load();
    setProcessing(null);
  };

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);
  const pendingCount = apps.filter(a => a.status === 'pending').length;

  const statusBadge = (status: AdminApplication['status']) => {
    if (status === 'pending')  return <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-xs font-bold text-yellow-300"><Clock className="h-3 w-3" /> Bekliyor</span>;
    if (status === 'approved') return <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-bold text-green-300"><CheckCircle className="h-3 w-3" /> Onaylandı</span>;
    return <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-300"><X className="h-3 w-3" /> Reddedildi</span>;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-400" /> Admin Başvuruları
          </h2>
          <p className="text-sm text-white/40 mt-0.5">{pendingCount} bekleyen başvuru</p>
        </div>
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition ${
                filter === f
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {f === 'pending' ? 'Bekleyen' : f === 'approved' ? 'Onaylı' : f === 'rejected' ? 'Reddedilmiş' : 'Tümü'}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-yellow-500 px-1.5 text-xs text-black font-black">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 py-14 text-center">
          <Shield className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="text-white/40">Bu kategoride başvuru bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <div
              key={app.id}
              className={`rounded-2xl border transition ${
                app.status === 'pending' ? 'border-yellow-500/20 bg-yellow-500/5'
                : app.status === 'approved' ? 'border-green-500/20 bg-green-500/5'
                : 'border-white/10 bg-white/5 opacity-70'
              }`}
            >
              {/* Başlık satırı */}
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-black text-white">
                    {app.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white">{app.fullName}</p>
                      {statusBadge(app.status)}
                    </div>
                    <p className="text-xs text-white/50">@{app.username} · {app.profession}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-white/30">{new Date(app.createdAt).toLocaleDateString('tr-TR')}</span>
                  <button
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 transition"
                  >
                    {expandedId === app.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Detay paneli */}
              {expandedId === app.id && (
                <div className="border-t border-white/10 p-4 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <InfoRow label="E-posta" value={app.email} />
                      <InfoRow label="Deneyim" value={app.experience} />
                    </div>
                    <div className="space-y-2">
                      {app.linkedin && <InfoRow label="LinkedIn" value={app.linkedin} link />}
                      {app.github  && <InfoRow label="GitHub"   value={app.github}   link />}
                      {app.twitter && <InfoRow label="Twitter"  value={app.twitter}  link />}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wide font-semibold">Başvuru Sebebi</p>
                    <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">{app.reason}</p>
                  </div>

                  {app.status === 'pending' && (
                    <div className="space-y-3">
                      <textarea
                        rows={2}
                        value={reviewNote}
                        onChange={e => setReviewNote(e.target.value)}
                        placeholder="İnceleme notu (reddetmek için zorunlu, onaylamak için opsiyonel)"
                        className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-indigo-400"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReview(app.id, 'approved')}
                          disabled={processing === app.id}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-500 transition disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Onayla & Admin Yap
                        </button>
                        <button
                          onClick={() => handleReview(app.id, 'rejected')}
                          disabled={processing === app.id}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600/80 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          Reddet
                        </button>
                      </div>
                    </div>
                  )}
                  {app.status !== 'pending' && app.reviewNote && (
                    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/60">
                      <span className="font-semibold text-white/80">Not:</span> {app.reviewNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      {link ? (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer"
          className="text-indigo-400 hover:text-indigo-300 text-xs inline-flex items-center gap-1">
          {value} <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <p className="text-sm font-semibold text-white">{value}</p>
      )}
    </div>
  );
}
