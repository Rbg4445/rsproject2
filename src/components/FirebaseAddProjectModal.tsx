import { useState } from 'react';
import { X, Plus, Trash2, Upload, FileText, Video } from 'lucide-react';
import { addProject } from '../firebase/firestoreService';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';

interface Props { onClose: () => void; onSuccess: () => void; }

const CATEGORIES = [
  { key: 'egitim', label: '📚 Eğitim' },
  { key: 'kodlama', label: '💻 Kodlama' },
  { key: 'akademi', label: '🎓 Akademi' },
  { key: 'tasarim', label: '🎨 Tasarım' },
];

const DIFFICULTIES = ['Başlangıç', 'Orta', 'İleri'];

const COVER_IMAGES = [
  { label: 'Eğitim', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80' },
  { label: 'Kodlama', url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80' },
  { label: 'Akademi', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80' },
  { label: 'Tasarım', url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80' },
  { label: 'Data', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80' },
  { label: 'Mobil', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80' },
];

export default function FirebaseAddProjectModal({ onClose, onSuccess }: Props) {
  const { userProfile } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [documents, setDocuments] = useState<
    { id: string; name: string; type: string; size: number; dataUrl: string; uploadedAt: string }[]
  >([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    category: 'kodlama',
    difficulty: 'Orta',
    duration: '',
    tags: [] as string[],
    github: '',
    demo: '',
    videoUrl: '',
    image: COVER_IMAGES[1].url,
    customImage: '',
  });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const addTag = () => {
    const tag = tagInput.trim().replace(/\s+/g, '-').toLowerCase();
    if (tag && !form.tags.includes(tag) && form.tags.length < 8) {
      set('tags', [...form.tags, tag]);
      setTagInput('');
    }
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Belge okunamadi'));
      reader.readAsDataURL(file);
    });

  const handleDocumentUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const picked = Array.from(files);
    const accepted = picked.filter((file) => file.size <= 5 * 1024 * 1024).slice(0, 5 - documents.length);

    const mapped = await Promise.all(
      accepted.map(async (file) => ({
        id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl: await fileToDataUrl(file),
        uploadedAt: new Date().toISOString(),
      }))
    );

    setDocuments((prev) => [...prev, ...mapped]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setLoading(true);
    try {
      await addProject({
        uid: userProfile.uid,
        username: userProfile.username,
        displayName: userProfile.displayName,
        title: form.title,
        description: form.description,
        content: form.content,
        category: form.category,
        difficulty: form.difficulty,
        duration: form.duration || '1 ay',
        tags: form.tags,
        github: form.github,
        demo: form.demo,
        videoUrl: form.videoUrl || undefined,
        image: form.customImage || form.image,
        documents,
        likes: [],
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Proje Yükle</h2>
              <p className="text-xs text-white/40">Topluluğa projenizi paylaşın</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-800 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white/60">Proje Başlığı *</label>
              <span className={`text-xs font-mono ${
                form.title.length > 55 ? 'text-red-400' :
                form.title.length > 45 ? 'text-yellow-400' :
                'text-white/30'
              }`}>
                {form.title.length}/60
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={60}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Projenizin adı (max 60 karakter)"
              className={`w-full px-4 py-3 rounded-xl bg-gray-800/50 border text-white placeholder-white/30 focus:outline-none text-sm transition-colors ${
                form.title.length > 55
                  ? 'border-red-500/60 focus:border-red-500'
                  : form.title.length > 45
                  ? 'border-yellow-500/40 focus:border-yellow-500'
                  : 'border-white/10 focus:border-indigo-500'
              }`}
            />
            {form.title.length >= 60 && (
              <p className="mt-1 text-xs text-red-400">⚠ Maksimum karakter sınırına ulaşıldı.</p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white/60">Açıklama *</label>
              <span className={`text-xs font-mono ${
                form.description.length > 270 ? 'text-red-400' :
                form.description.length > 220 ? 'text-yellow-400' :
                'text-white/30'
              }`}>
                {form.description.length}/300
              </span>
            </div>
            <textarea
              required
              maxLength={300}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Projenizi kısaca anlatın... (max 300 karakter)"
              rows={3}
              className={`w-full px-4 py-3 rounded-xl bg-gray-800/50 border text-white placeholder-white/30 focus:outline-none text-sm resize-none transition-colors ${
                form.description.length > 270
                  ? 'border-red-500/60 focus:border-red-500'
                  : form.description.length > 220
                  ? 'border-yellow-500/40 focus:border-yellow-500'
                  : 'border-white/10 focus:border-indigo-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Detaylı İnceleme İçeriği</label>
            <textarea
              value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder="Projeyi nasıl geliştirdiğini, mimarisini ve kullanılan teknolojileri yaz..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm resize-none"
            />
          </div>

          {/* Category & Difficulty */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Kategori</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white focus:outline-none focus:border-indigo-500 text-sm"
              >
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Zorluk Seviyesi</label>
              <select
                value={form.difficulty}
                onChange={e => set('difficulty', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white focus:outline-none focus:border-indigo-500 text-sm"
              >
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Süre</label>
            <input
              type="text"
              value={form.duration}
              onChange={e => set('duration', e.target.value)}
              placeholder="Örn: 2 hafta, 3 ay"
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm"
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
                <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-lg border border-indigo-500/20">
                  #{tag}
                  <button type="button" onClick={() => set('tags', form.tags.filter(t => t !== tag))}>
                    <Trash2 className="w-3 h-3 hover:text-red-400" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">GitHub Link</label>
              <input
                type="url"
                value={form.github}
                onChange={e => set('github', e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Demo Link</label>
              <input
                type="url"
                value={form.demo}
                onChange={e => set('demo', e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              <span className="inline-flex items-center gap-1.5">
                <Video className="w-4 h-4 text-purple-400" />
                Video Linki
                <span className="ml-1 text-white/30 text-xs font-normal">(YouTube, Vimeo veya direkt video URL)</span>
              </span>
            </label>
            <input
              type="url"
              value={form.videoUrl}
              onChange={e => set('videoUrl', e.target.value)}
              placeholder="https://youtube.com/watch?v=... veya https://vimeo.com/..."
              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 text-sm"
            />
            {form.videoUrl && (
              <p className="mt-1.5 text-xs text-purple-400/70">✓ Video linki eklendi — proje sayfasında oynatıcı olarak gösterilecek</p>
            )}
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Kapak Görseli</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {COVER_IMAGES.map(img => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => set('image', img.url)}
                  className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all ${form.image === img.url && !form.customImage ? 'border-indigo-500' : 'border-white/10'}`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  {form.image === img.url && !form.customImage && (
                    <div className="absolute inset-0 bg-indigo-500/30 flex items-center justify-center">
                      <span className="text-white text-lg">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <input
              type="url"
              value={form.customImage}
              onChange={e => set('customImage', e.target.value)}
              placeholder="Veya özel görsel URL'si girin"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Belgeler (PDF, DOCX, ZIP) - Max 5 adet, her biri 5MB</label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-gray-800/40 px-4 py-3 text-sm text-white/70 hover:border-indigo-500/40 hover:text-white">
              <FileText className="h-4 w-4" />
              Belge Sec
              <input
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
                onChange={(e) => void handleDocumentUpload(e.target.files)}
              />
            </label>

            {documents.length > 0 && (
              <div className="mt-3 space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-gray-800/40 px-3 py-2 text-sm">
                    <div>
                      <p className="text-white/90">{doc.name}</p>
                      <p className="text-white/50 text-xs">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocuments((prev) => prev.filter((d) => d.id !== doc.id))}
                      className="rounded-lg p-2 text-red-300 hover:bg-red-500/15"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-800 border border-white/10 text-white/60 font-semibold hover:text-white transition">
              İptal
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition disabled:opacity-50">
              {loading ? 'Yükleniyor...' : '🚀 Projeyi Yayınla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
