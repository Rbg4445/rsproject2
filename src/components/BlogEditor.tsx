import { useState } from 'react';
import { X, FileText, Plus, Minus, Image } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { BlogPost } from '../types';
import * as db from '../store/db';

interface BlogEditorProps {
  existingBlog?: BlogPost | null;
  onClose: () => void;
  onSaved: () => void;
}

const defaultCovers = [
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800&h=400&fit=crop',
];

export default function BlogEditor({ existingBlog, onClose, onSaved }: BlogEditorProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(existingBlog?.title || '');
  const [content, setContent] = useState(existingBlog?.content || '');
  const [excerpt, setExcerpt] = useState(existingBlog?.excerpt || '');
  const [coverImage, setCoverImage] = useState(existingBlog?.coverImage || defaultCovers[0]);
  const [tags, setTags] = useState<string[]>(existingBlog?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  if (!user) return null;

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setLoading(true);

    setTimeout(() => {
      if (existingBlog) {
        db.updateBlog(existingBlog.id, { title, content, excerpt, coverImage, tags });
      } else {
        db.addBlog({ userId: user.id, title, content, excerpt, coverImage, tags });
      }
      setLoading(false);
      onSaved();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              {existingBlog ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı'}
            </h2>
            <p className="text-sm text-slate-400">Bilgilerinizi topluluğa paylaşın</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kapak Görseli</label>
            <div className="relative rounded-2xl overflow-hidden h-48 mb-2 group">
              <img src={coverImage} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setShowCoverPicker(!showCoverPicker)}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-semibold text-slate-700">
                  <Image className="w-4 h-4" />
                  Görseli Değiştir
                </div>
              </button>
            </div>
            {showCoverPicker && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {defaultCovers.map((img) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => { setCoverImage(img); setShowCoverPicker(false); }}
                    className={`rounded-xl overflow-hidden border-2 transition ${
                      coverImage === img ? 'border-indigo-500' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="veya özel URL girin"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Başlık *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog yazınızın başlığı"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kısa Özet</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Yazınızın kısa bir özeti (liste görünümünde gösterilir)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              İçerik * <span className="text-slate-400 font-normal">(Markdown desteklenir)</span>
            </label>
            <textarea
              required
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Yazınızı buraya yazın...\n\n## Başlık\n\nParagraf metni...\n\n- Madde 1\n- Madde 2\n\n\`\`\`javascript\nconsole.log("Kod bloğu");\n\`\`\``}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono"
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
              disabled={loading || !title || !content}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Kaydediliyor...' : existingBlog ? '✏️ Güncelle' : '📝 Yayınla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
