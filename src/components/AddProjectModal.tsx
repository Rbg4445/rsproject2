import { useState } from 'react';
import { X, Upload, Plus, Minus } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import * as db from '../store/db';

interface AddProjectModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const categoryOptions = [
  { value: 'kodlama', label: '💻 Kodlama' },
  { value: 'egitim', label: '📚 Eğitim' },
  { value: 'akademi', label: '🎓 Akademi' },
  { value: 'tasarim', label: '🎨 Tasarım' },
] as const;

const difficultyOptions = ['Başlangıç', 'Orta', 'İleri'] as const;

const defaultImages = [
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&h=400&fit=crop',
];

export default function AddProjectModal({ onClose, onSaved }: AddProjectModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'kodlama' | 'egitim' | 'akademi' | 'tasarim'>('kodlama');
  const [difficulty, setDifficulty] = useState<'Başlangıç' | 'Orta' | 'İleri'>('Orta');
  const [duration, setDuration] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(defaultImages[0]);
  const [github, setGithub] = useState('');
  const [demo, setDemo] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 6) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setLoading(true);

    setTimeout(() => {
      db.addProject({
        userId: user.id,
        title,
        description,
        category,
        tags,
        image,
        difficulty,
        duration: duration || '1 hafta',
        github: github || undefined,
        demo: demo || undefined,
      });
      setLoading(false);
      onSaved();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-500" />
              Yeni Proje Ekle
            </h2>
            <p className="text-sm text-slate-400">Projenizi topluluğa paylaşın</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Proje Başlığı *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: React ile Todo Uygulaması"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Açıklama *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Projenizi detaylı olarak açıklayın..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Zorluk Seviyesi</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {difficultyOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Süre</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Örn: 4 hafta"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Etiketler</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-full">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <Minus className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Etiket ekle (Enter)"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2.5 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kapak Görseli</label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {defaultImages.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setImage(img)}
                  className={`rounded-xl overflow-hidden border-2 transition ${
                    image === img ? 'border-indigo-500 shadow-lg' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-16 object-cover" />
                </button>
              ))}
            </div>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="veya özel görsel URL'si girin"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">GitHub URL</label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Demo URL</label>
              <input
                type="url"
                value={demo}
                onChange={(e) => setDemo(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !title || !description}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Yükleniyor...' : '🚀 Projeyi Paylaş'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
