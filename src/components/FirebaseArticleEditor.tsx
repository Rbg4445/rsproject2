import { useState } from 'react';
import { X, Plus, Trash2, BookText } from 'lucide-react';
import { addArticle, FirestoreArticle } from '../firebase/firestoreService';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function FirebaseArticleEditor({ onClose, onSuccess }: Props) {
  const { userProfile } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    tags: [] as string[],
  });

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const addTag = () => {
    const raw = tagInput.trim().replace(/^#+/, ''); // Başındaki # simgelerini kaldır
    const normalized = raw.toLowerCase().replace(/\s+/g, '-');
    if (!normalized || form.tags.includes(normalized) || form.tags.length >= 10) return;
    set('tags', [...form.tags, normalized]);
    setTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setLoading(true);
    try {
      const now = new Date().toISOString();
            const articleData: Omit<FirestoreArticle, 'id'> = {
        uid: userProfile.uid,
        username: userProfile.username,
        displayName: userProfile.displayName,
        title: form.title,
        summary: form.summary,
        content: form.content,
        tags: form.tags,
        likes: [],
        views: 0,
        status: 'pending', // admin onayi bekliyor
        createdAt: now,
        updatedAt: now,
      };

      if (form.coverImage && form.coverImage.trim() !== '') {
        // Bos degilse ancak o zaman coverImage alanini ekle
        (articleData as any).coverImage = form.coverImage.trim();
      }

      await addArticle(articleData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-gray-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-white/10 bg-gray-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <BookText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Makale Yaz</h2>
              <p className="text-xs text-white/40">Wikipedia stili bilgi sayfası oluştur</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-gray-800 text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/60">Baslik *</label>
            <input
              required
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Orn: React Hooks"
              className="w-full rounded-xl border border-white/10 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/60">Kisa Ozet *</label>
            <textarea
              required
              rows={2}
              value={form.summary}
              onChange={(e) => set('summary', e.target.value)}
              placeholder="Bu makale ne anlatiyor?"
              className="w-full resize-none rounded-xl border border-white/10 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/60">Kapak Gorseli (opsiyonel)</label>
            <input
              type="url"
              value={form.coverImage}
              onChange={(e) => set('coverImage', e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-white/10 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/60">Icerik *</label>
            <textarea
              required
              rows={12}
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              placeholder={'Markdown destekli.\nOrnek baglanti: [[React Hooks]]'}
              className="w-full resize-none rounded-xl border border-white/10 bg-gray-800/50 px-4 py-3 font-mono text-sm text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/60">Etiketler</label>
            <div className="mb-2 flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="etiket ekle"
                className="flex-1 rounded-xl border border-white/10 bg-gray-800/50 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none"
              />
              <button type="button" onClick={addTag} className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                  #{tag}
                  <button type="button" onClick={() => set('tags', form.tags.filter((t) => t !== tag))}>
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/10 bg-gray-800 py-3 font-semibold text-white/70">
              Iptal
            </button>
            <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 py-3 font-bold text-white disabled:opacity-50">
              {loading ? 'Kaydediliyor...' : 'Makaleyi Yayinla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}