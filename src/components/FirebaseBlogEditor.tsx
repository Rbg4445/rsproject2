import { useState, useRef } from 'react';
import { X, Upload, Plus, Trash2, Loader } from 'lucide-react';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import { addBlog, updateBlog, FirestoreBlog } from '../firebase/firestoreService';
import { uploadBlogCover, validateFile } from '../firebase/storageService';

interface Props {
  existingBlog?: FirestoreBlog | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
  'https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?w=800&q=80',
  'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&q=80',
];

export default function FirebaseBlogEditor({ existingBlog, onClose, onSuccess }: Props) {
  const { firebaseUser, userProfile } = useFirebaseAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(existingBlog?.title || '');
  const [content, setContent] = useState(existingBlog?.content || '');
  const [excerpt, setExcerpt] = useState(existingBlog?.excerpt || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(existingBlog?.tags || []);
  const [selectedCover, setSelectedCover] = useState(existingBlog?.coverImage || PRESET_COVERS[0]);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState('');
  const [coverTab, setCoverTab] = useState<'preset' | 'upload' | 'url'>('preset');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!firebaseUser) return;
    const validation = validateFile(file);
    if (!validation.valid) { setUploadError(validation.error || 'Geçersiz dosya'); return; }

    setUploading(true); setUploadError(''); setUploadProgress(0);
    try {
      const url = await uploadBlogCover(firebaseUser.uid, file, (p) => setUploadProgress(p.progress));
      setUploadedCoverUrl(url);
      setCoverTab('upload');
    } catch {
      setUploadError('Görsel yüklenemedi.');
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 8) { setTags([...tags, t]); setTagInput(''); }
  };

  const getFinalCover = () => {
    if (coverTab === 'upload' && uploadedCoverUrl) return uploadedCoverUrl;
    if (coverTab === 'url' && customCoverUrl) return customCoverUrl;
    return selectedCover;
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-6 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-white/10 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-white/70">• $1</li>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-indigo-400 hover:underline" target="_blank">$1</a>')
      .replace(/\n\n/g, '</p><p class="mb-3 text-white/70">')
      .replace(/\n/g, '<br/>');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !userProfile) return;
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Başlık ve içerik zorunludur.');
      return;
    }

    setSubmitting(true);
    try {
      if (existingBlog) {
        await updateBlog(existingBlog.id, {
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || content.slice(0, 200),
          coverImage: getFinalCover(),
          tags,
        });
      } else {
        await addBlog({
          userId: firebaseUser.uid,
          authorUsername: userProfile.username,
          authorName: userProfile.displayName,
          authorAvatar: userProfile.avatar || '',
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || content.slice(0, 200),
          coverImage: getFinalCover(),
          tags,
          likes: 0,
          likedBy: [],
          views: 0,
          status: 'active',
          reportCount: 0,
        });
      }
      onSuccess();
      onClose();
    } catch {
      setError('Blog kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-white font-bold text-lg">
            {existingBlog ? '✏️ Blog Düzenle' : '📝 Yeni Blog Yazısı'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                preview ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/60 border border-white/10'
              }`}
            >
              {preview ? '✏️ Düzenle' : '👁️ Önizle'}
            </button>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm mb-4">{error}</div>
          )}

          {preview ? (
            <div className="prose prose-invert max-w-none">
              {getFinalCover() && (
                <img src={getFinalCover()} alt="" className="w-full h-48 object-cover rounded-xl mb-6" />
              )}
              <h1 className="text-2xl font-bold text-white mb-2">{title || 'Başlık...'}</h1>
              <div
                className="text-white/70 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content || 'İçerik...') }}
              />
            </div>
          ) : (
            <form id="blog-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Başlık */}
              <div>
                <label className="block text-white/70 text-sm mb-1.5">Başlık *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Blog başlığı..."
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Özet */}
              <div>
                <label className="block text-white/70 text-sm mb-1.5">Kısa Özet</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Blog yazınızın kısa özeti..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all resize-none text-sm"
                />
              </div>

              {/* Kapak Görseli */}
              <div>
                <label className="block text-white/70 text-sm mb-1.5">Kapak Görseli</label>
                <div className="flex gap-2 mb-3">
                  {(['preset', 'upload', 'url'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setCoverTab(t)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                        coverTab === t ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
                      }`}>
                      {t === 'preset' ? '🖼️ Hazır' : t === 'upload' ? '⬆️ Yükle' : '🔗 URL'}
                    </button>
                  ))}
                </div>

                {coverTab === 'preset' && (
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_COVERS.map((img) => (
                      <div key={img} onClick={() => setSelectedCover(img)}
                        className={`relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                          selectedCover === img ? 'border-indigo-500' : 'border-transparent'
                        }`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {coverTab === 'upload' && (
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} className="hidden" />
                    {!uploadedCoverUrl ? (
                      <div onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-white/5 transition-all">
                        {uploading ? (
                          <div className="space-y-2">
                            <Loader className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                            <p className="text-white/60 text-sm">%{Math.round(uploadProgress)}</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-white/40 mx-auto mb-2" />
                            <p className="text-white/60 text-sm">Kapak görseli yükle</p>
                            <p className="text-white/30 text-xs mt-1">Max 5MB</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <img src={uploadedCoverUrl} alt="" className="w-full h-40 object-cover rounded-xl" />
                        <button type="button" onClick={() => { setUploadedCoverUrl(''); setCoverTab('preset'); }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
                  </div>
                )}

                {coverTab === 'url' && (
                  <input type="url" value={customCoverUrl} onChange={(e) => setCustomCoverUrl(e.target.value)}
                    placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm" />
                )}
              </div>

              {/* İçerik */}
              <div>
                <label className="block text-white/70 text-sm mb-1.5">İçerik * <span className="text-white/30">(Markdown desteklenir)</span></label>
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-all">
                  <div className="flex gap-2 px-3 py-2 border-b border-white/10 flex-wrap">
                    {[
                      { label: 'H1', insert: '# Başlık\n' },
                      { label: 'H2', insert: '## Başlık\n' },
                      { label: 'H3', insert: '### Başlık\n' },
                      { label: 'Kalın', insert: '**metin**' },
                      { label: 'İtalik', insert: '*metin*' },
                      { label: 'Kod', insert: '`kod`' },
                      { label: '- Liste', insert: '- madde\n' },
                      { label: 'Link', insert: '[metin](url)' },
                    ].map((b) => (
                      <button key={b.label} type="button"
                        onClick={() => setContent((prev) => prev + b.insert)}
                        className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-2 py-1 rounded text-xs transition-all">
                        {b.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Blog içeriğinizi buraya yazın... Markdown desteklenir.

# Başlık 1
## Başlık 2

**Kalın metin** ve *italik metin*

- Liste maddesi 1
- Liste maddesi 2

`kod örneği`"
                    required
                    rows={14}
                    className="w-full bg-transparent py-3 px-4 text-white placeholder-white/20 focus:outline-none resize-none text-sm font-mono"
                  />
                </div>
              </div>

              {/* Etiketler */}
              <div>
                <label className="block text-white/70 text-sm mb-1.5">Etiketler</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Etiket yaz, Enter'a bas"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm" />
                  <button type="button" onClick={addTag} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-xl">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 bg-purple-600/30 text-purple-300 text-xs px-3 py-1 rounded-full">
                      #{tag}
                      <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4 flex gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 bg-white/5 text-white/70 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
            İptal
          </button>
          <button
            form="blog-form"
            type="submit"
            disabled={submitting}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader className="w-4 h-4 animate-spin" /> Kaydediliyor...</> : existingBlog ? '✓ Güncelle' : '📝 Yayınla'}
          </button>
        </div>
      </div>
    </div>
  );
}
