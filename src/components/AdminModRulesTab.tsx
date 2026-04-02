import { useEffect, useState } from 'react';
import { Settings, Plus, Trash2, AlertTriangle } from 'lucide-react';
import {
  type ModerationRule,
  getModerationRules,
  addModerationRule,
  deleteModerationRule,
} from '../firebase/firestoreService';

interface Props { userEmail: string; }

export default function AdminModRulesTab({ userEmail }: Props) {
  const [rules, setRules] = useState([] as ModerationRule[]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [action, setAction] = useState('flag' as ModerationRule['action']);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setRules(await getModerationRules());
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!keyword.trim()) return;
    setSaving(true);
    await addModerationRule(keyword.trim(), action, userEmail);
    setKeyword('');
    await load();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteModerationRule(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-400" /> Otomatik Moderasyon Kuralları
        </h2>
        <p className="text-sm text-white/40 mt-0.5">
          Bu kurallara uyan içerikler otomatik olarak işaretlenir veya reddedilir.
        </p>
      </div>

      {/* Bilgi kutusu */}
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-300 flex gap-3">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Nasıl çalışır?</p>
          <p className="text-yellow-300/70 mt-0.5">
            Kullanıcı içerik yüklediğinde başlık ve açıklama, bu listedeki anahtar kelimelerle karşılaştırılır.
            <strong> Flag</strong> eşleşirse içerik yine de yüklenir fakat admin incelemeye alınır.
            <strong> Reject</strong> eşleşirse yükleme tamamen engellenir.
          </p>
        </div>
      </div>

      {/* Yeni Kural Ekle */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
        <h3 className="font-bold text-white text-sm">Yeni Kural Ekle</h3>
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Anahtar kelime (örn: spam, reklam)"
            className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-indigo-400"
          />
          <select
            value={action}
            onChange={e => setAction(e.target.value as ModerationRule['action'])}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
          >
            <option value="flag">🏳 İşaretle (Flag)</option>
            <option value="reject">🚫 Reddet (Reject)</option>
          </select>
          <button
            onClick={handleAdd}
            disabled={saving || !keyword.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> Ekle
          </button>
        </div>
      </div>

      {/* Mevcut Kurallar */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : rules.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 py-12 text-center">
          <Settings className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="text-white/40 text-sm">Henüz moderasyon kuralı yok.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map(rule => (
            <div
              key={rule.id}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                rule.action === 'reject'
                  ? 'border-red-500/20 bg-red-500/5'
                  : 'border-yellow-500/20 bg-yellow-500/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${rule.action === 'reject' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {rule.action === 'reject' ? '🚫' : '🏳'}
                </span>
                <div>
                  <p className="font-mono text-sm font-semibold text-white">"{rule.keyword}"</p>
                  <p className="text-xs text-white/40">
                    {rule.action === 'reject' ? 'Otomatik reddet' : 'Admin incelemesine al'} · {new Date(rule.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(rule.id)}
                className="rounded-lg p-2 text-white/30 hover:bg-red-500/20 hover:text-red-400 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
