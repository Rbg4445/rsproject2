import { useState } from 'react';
import { X, Plus, Trash2, PenLine } from 'lucide-react';
import { addBlog } from '../firebase/firestoreService';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';

interface Props { onClose: () => void; onSuccess: () => void; }

const COVER_IMAGES = [
  { label: 'Yazı', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80' },
  { label: 'Kod', url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80' },
  { label: 'Kitap', url: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=80' },
  { label: 'Teknoloji', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80' },
  { label: 'Eğitim', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80' },
  { label: 'Veri', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80' },
];

export default function FirebaseBlogEditor({ onClose, onSuccess }: Props) {
  const { userProfile } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    coverImage: COVER_IMAGES[0].url,
    customCover: '',
    tags: [] as string[],
  });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const addTag = () => {
    const raw = tagInput.trim().replace(/^#+/, ''); // Başındaki # simgelerini kaldır
    const tag = raw.replace(/\s+/g, '-').toLowerCase();
    if (tag && !form.tags.includes(tag) && form.tags.length < 8) {
      set('tags', [...form.tags, tag]);
      setTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setLoading(true);
    try {
      await addBlog({
        uid: userProfile.uid,
        username: userProfile.username,
        displayName: userProfile.displayName,
        title: form.title,
        content: form.content,
        summary: form.summary,
        coverImage: form.customCover || form.coverImage,
        tags: form.tags,
        likes: [],
        views: 0,
        status: 'pending', // admin onayi bekliyor
        createdAt: new Date().toISOString(),
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative bg-gray-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <PenLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Blog Yazısı Yaz</h2>
              <p className="text-xs text-white/40">Düşüncelerinizi paylaşın</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-800 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Başlık *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Blog yazınızın başlığı"
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Özet *</label>
            <textarea
              required
              value={form.summary}
              onChange={e => set('summary', e.target.value)}
              placeholder="Blog yazınızın kısa özeti..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">İçerik *</label>
            <textarea
              required
              value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder="Blog yazınızı buraya yazın..."
              rows={10}
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm resize-none font-mono"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Etiketler</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Etiket ekle (Enter)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm"
              />
              <button type="button" onClick={addTag} className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 hover:bg-indigo-500/30">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-lg border border-purple-500/20">
                  #{tag}
                  <button type="button" onClick={() => set('tags', form.tags.filter(t => t !== tag))}>
                    <Trash2 className="w-3 h-3 hover:text-red-400" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Kapak Görseli</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {COVER_IMAGES.map(img => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => set('coverImage', img.url)}
                  className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all ${form.coverImage === img.url && !form.customCover ? 'border-purple-500' : 'border-white/10'}`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  {form.coverImage === img.url && !form.customCover && (
                    <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                      <span className="text-white text-lg">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <input
              type="url"
              value={form.customCover}
              onChange={e => set('customCover', e.target.value)}
              placeholder="Veya özel görsel URL'si girin"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-800 border border-white/10 text-white/60 font-semibold hover:text-white transition">
              İptal
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/25 transition disabled:opacity-50">
              {loading ? 'Yayınlanıyor...' : '✍️ Blogu Yayınla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
