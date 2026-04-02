import { useEffect, useState } from 'react';
import { Flag, CheckCircle, X, Clock } from 'lucide-react';
import { type ContentReport, getReports, updateReportStatus } from '../firebase/firestoreService';

interface Props {
  userEmail: string;
}

export default function AdminReportsTab({ userEmail }: Props) {
  const [reports, setReports] = useState([] as ContentReport[]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open' as ContentReport['status'] | 'all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await getReports();
    setReports(data);
    setLoading(false);
  };

  const resolve = async (id: string, status: ContentReport['status']) => {
    await updateReportStatus(id, status, userEmail);
    await load();
  };

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);
  const openCount = reports.filter(r => r.status === 'open').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-400" /> Şikayet Yönetimi
          </h2>
          <p className="text-sm text-white/40 mt-0.5">{openCount} açık şikayet</p>
        </div>
        <div className="flex gap-2">
          {(['open', 'resolved', 'dismissed', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition ${
                filter === f
                  ? f === 'open' ? 'bg-red-600 border-red-500 text-white'
                  : f === 'resolved' ? 'bg-green-600 border-green-500 text-white'
                  : f === 'dismissed' ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {f === 'open' ? 'Açık' : f === 'resolved' ? 'Çözüldü' : f === 'dismissed' ? 'Reddedildi' : 'Tümü'}
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
          <Flag className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="text-white/40">Bu kategoride şikayet bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div
              key={r.id}
              className={`rounded-2xl border p-4 ${
                r.status === 'open' ? 'border-red-500/30 bg-red-500/5'
                : r.status === 'resolved' ? 'border-green-500/20 bg-green-500/5'
                : 'border-white/10 bg-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${
                      r.status === 'open' ? 'border-red-500/30 text-red-300'
                      : r.status === 'resolved' ? 'border-green-500/30 text-green-300'
                      : 'border-gray-500/30 text-gray-400'
                    }`}>
                      {r.status === 'open' ? <Clock className="h-3 w-3" /> : r.status === 'resolved' ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {r.status === 'open' ? 'Açık' : r.status === 'resolved' ? 'Çözüldü' : 'Reddedildi'}
                    </span>
                    <span className="text-xs text-white/40 capitalize">{r.refType}</span>
                  </div>
                  <p className="font-bold text-white">"{r.refTitle}"</p>
                  <p className="text-sm text-white/60 mt-0.5">
                    <span className="font-semibold text-white/80">Sebep:</span> {r.reason}
                  </p>
                  {r.details && (
                    <p className="text-xs text-white/50 mt-1 bg-black/20 rounded-lg px-3 py-2">{r.details}</p>
                  )}
                  <div className="mt-2 flex gap-3 text-xs text-white/40">
                    <span>@{r.reporterUsername}</span>
                    <span>{new Date(r.createdAt).toLocaleString('tr-TR')}</span>
                    {r.resolvedBy && <span>→ {r.resolvedBy}</span>}
                  </div>
                </div>
                {r.status === 'open' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => resolve(r.id, 'resolved')}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-500"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => resolve(r.id, 'dismissed')}
                      className="rounded-lg bg-gray-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
