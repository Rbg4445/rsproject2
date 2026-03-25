import { useState, useRef } from 'react';
import { X, Upload, Plus, Trash2, Image, Loader, Link } from 'lucide-react';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import { addProject } from '../firebase/firestoreService';
import { uploadProjectImage, validateFile } from '../firebase/storageService';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: 'egitim', label: '📚 Eğitim' },
  { value: 'kodlama', label: '💻 Kodlama' },
  { value: 'akademi', label: '🎓 Akademi' },
  { value: 'tasarim', label: '🎨 Tasarım' },
];

const DIFFICULTIES = ['Başlangıç', 'Orta', 'İleri'] as const;

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  'https://images.unsplash.com/photo-1587620962725-abab19836100?w=800&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80',
  'https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&q=80',
];

export default function FirebaseAddProjectModal({ onClose, onSuccess }: Props) {
  const { firebaseUser, userProfile } = useFirebaseAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'egitim' | 'kodlama' | 'akademi' | 'tasarim'>('kodlama');
  const [difficulty, setDifficulty] = useState<'Başlangıç' | 'Orta' | 'İleri'>('Başlangıç');
  const [duration, setDuration] = useState('');
  const [github, setGithub] = useState('');
  const [demo, setDemo] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageTab, setImageTab] = useState<'preset' | 'upload' | 'url'>('preset');

  const handleFileUpload = async (file: File) => {
    if (!firebaseUser) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Geçersiz dosya');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadProgress(0);

    try {
      const url = await uploadProjectImage(firebaseUser.uid, file, (p) => {
        setUploadProgress(p.progress);
      });
      setUploadedImageUrl(url);
      setImageTab('upload');
    } catch (err) {
      setUploadError('Görsel yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const getFinalImage = () => {
    if (imageTab === 'upload' && uploadedImageUrl) return uploadedImageUrl;
    if (imageTab === 'url' && customImageUrl) return customImageUrl;
    return selectedImage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !userProfile) return;
    setError('');

    if (!title.trim() || !description.trim() || !duration.trim()) {
      setError('Lütfen zorunlu alanları doldurun.');
      return;
    }

    setSubmitting(true);
    try {
      await addProject({
        userId: firebaseUser.uid,
        authorUsername: userProfile.username,
        authorName: userProfile.displayName,
        authorAvatar: userProfile.avatar || '',
        title: title.trim(),
        description: description.trim(),
        category,
        tags,
        image: getFinalImage(),
        difficulty,
        duration: duration.trim(),
        github: github.trim(),
        demo: demo.trim(),
        likes: 0,
        likedBy: [],
        status: 'active',
        reportCount: 0,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError('Proje eklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <span>🚀</span> Proje Ekle
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm">{error}</div>
          )}

          {/* Başlık */}
          <div>
            <label className="block text-white/70 text-sm mb-1.5">Proje Başlığı *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: React ile E-Ticaret Sitesi"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
            />
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-white/70 text-sm mb-1.5">Açıklama *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Projenizi detaylıca açıklayın..."
              required
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm resize-none"
            />
          </div>

          {/* Kategori & Zorluk & Süre */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Kategori *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Zorluk *</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d} className="bg-gray-900">{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Süre *</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Örn: 3 Ay"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Görsel */}
          <div>
            <label className="block text-white/70 text-sm mb-1.5">Kapak Görseli</label>
            <div className="flex gap-2 mb-3">
              {(['preset', 'upload', 'url'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setImageTab(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                    imageTab === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
                  }`}
                >
                  {t === 'preset' ? '🖼️ Hazır' : t === 'upload' ? '⬆️ Yükle' : '🔗 URL'}
                </button>
              ))}
            </div>

            {imageTab === 'preset' && (
              <div className="grid grid-cols-3 gap-2">
                {PRESET_IMAGES.map((img) => (
                  <div
                    key={img}
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImage === img && imageTab === 'preset'
                        ? 'border-indigo-500'
                        : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {imageTab === 'upload' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {!uploadedImageUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-white/5 transition-all"
                  >
                    {uploading ? (
                      <div className="space-y-2">
                        <Loader className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                        <p className="text-white/60 text-sm">Yükleniyor... %{Math.round(uploadProgress)}</p>
                        <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-white/40 mx-auto mb-2" />
                        <p className="text-white/60 text-sm">Görsel seçmek için tıklayın</p>
                        <p className="text-white/30 text-xs mt-1">JPEG, PNG, GIF, WebP • Max 5MB</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <img src={uploadedImageUrl} alt="" className="w-full h-40 object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => { setUploadedImageUrl(''); setImageTab('preset'); }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-lg">
                      ✓ Yüklendi
                    </div>
                  </div>
                )}
                {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
              </div>
            )}

            {imageTab === 'url' && (
              <div className="relative">
                <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            )}

            {/* Önizleme */}
            {getFinalImage() && (
              <div className="mt-2">
                <p className="text-white/40 text-xs mb-1">Önizleme:</p>
                <img src={getFinalImage()} alt="Önizleme" className="w-full h-32 object-cover rounded-xl" />
              </div>
            )}
          </div>

          {/* Etiketler */}
          <div>
            <label className="block text-white/70 text-sm mb-1.5">Etiketler</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Etiket yaz, Enter'a bas"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-indigo-600/30 text-indigo-300 text-xs px-3 py-1 rounded-full"
                >
                  #{tag}
                  <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Linkler */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/70 text-sm mb-1.5">GitHub</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Demo Link</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="url"
                  value={demo}
                  onChange={(e) => setDemo(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 py-3 rounded-xl transition-all border border-white/10"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader className="w-4 h-4 animate-spin" /> Ekleniyor...</> : '🚀 Projeyi Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
