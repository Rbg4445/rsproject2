import { useState, useEffect } from 'react';
import { Search, Heart, Loader, Filter } from 'lucide-react';
import { getAllProjects, FirestoreProject, toggleProjectLike } from '../firebase/firestoreService';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';

const CATEGORIES = [
  { value: 'all', label: '🌐 Tümü' },
  { value: 'egitim', label: '📚 Eğitim' },
  { value: 'kodlama', label: '💻 Kodlama' },
  { value: 'akademi', label: '🎓 Akademi' },
  { value: 'tasarim', label: '🎨 Tasarım' },
];

export default function FirebaseExplorePage() {
  const { firebaseUser } = useFirebaseAuth();
  const [projects, setProjects] = useState<FirestoreProject[]>([]);
  const [filtered, setFiltered] = useState<FirestoreProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [likeLoading, setLikeLoading] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    let result = projects.filter((p) => p.status === 'active');
    if (activeCategory !== 'all') result = result.filter((p) => p.category === activeCategory);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.authorUsername.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [projects, search, activeCategory]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error('Projeler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (project: FirestoreProject) => {
    if (!firebaseUser) return;
    setLikeLoading(project.id);
    const liked = project.likedBy?.includes(firebaseUser.uid);
    try {
      await toggleProjectLike(project.id, firebaseUser.uid, liked);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? {
                ...p,
                likes: liked ? p.likes - 1 : p.likes + 1,
                likedBy: liked
                  ? p.likedBy.filter((id) => id !== firebaseUser.uid)
                  : [...(p.likedBy || []), firebaseUser.uid],
              }
            : p
        )
      );
    } finally {
      setLikeLoading(null);
    }
  };

  const getDifficultyColor = (d: string) => {
    if (d === 'Başlangıç') return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (d === 'Orta') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Başlık */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3">
            🌐 Topluluk <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Projeleri</span>
          </h1>
          <p className="text-white/50">Topluluğun paylaştığı {projects.filter(p => p.status === 'active').length} projeyi keşfet</p>
        </div>

        {/* Arama & Filtre */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Proje, etiket veya kullanıcı ara..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setActiveCategory(c.value)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === c.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projeler */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <Loader className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
              <p className="text-white/40">Projeler yükleniyor...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 text-white/30">
            <Filter className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Proje bulunamadı</p>
            <p className="text-sm mt-1">Farklı bir arama veya kategori deneyin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((project) => {
              const isLiked = firebaseUser && project.likedBy?.includes(firebaseUser.uid);
              return (
                <div
                  key={project.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/8 transition-all group"
                >
                  {/* Görsel */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <span className="bg-indigo-600/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                        {project.category}
                      </span>
                      <span className={`backdrop-blur-sm text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(project.difficulty)}`}>
                        {project.difficulty}
                      </span>
                    </div>
                    {/* Yazar */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                        {project.authorAvatar ? (
                          <img src={project.authorAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          project.authorName?.[0]?.toUpperCase() || '?'
                        )}
                      </div>
                      <span className="text-white/80 text-xs">@{project.authorUsername}</span>
                    </div>
                  </div>

                  {/* İçerik */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-1.5 line-clamp-1">{project.title}</h3>
                    <p className="text-white/50 text-xs line-clamp-2 mb-3">{project.description}</p>

                    {/* Etiketler */}
                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-indigo-400/70 text-xs">#{tag}</span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="text-white/30 text-xs">+{project.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Alt Bilgi */}
                    <div className="flex items-center justify-between">
                      <span className="text-white/30 text-xs">⏱ {project.duration}</span>
                      <button
                        onClick={() => handleLike(project)}
                        disabled={!firebaseUser || likeLoading === project.id}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                          isLiked
                            ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                            : 'bg-white/5 text-white/40 hover:text-pink-400 border border-white/10 hover:border-pink-500/30'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {likeLoading === project.id ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : (
                          <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                        )}
                        {project.likes}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
