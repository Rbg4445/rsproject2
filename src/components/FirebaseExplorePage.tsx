import { useState, useEffect } from 'react';
import { Search, Filter, Heart, ExternalLink, Tag, Download, FileText, Plus, Video } from 'lucide-react';
import { getProjects, toggleProjectLike, FirestoreProject } from '../firebase/firestoreService';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import { GithubIcon } from './icons';
import FirebaseAddProjectModal from './FirebaseAddProjectModal';
import CommentsSection from './CommentsSection';

// ─── Video embed yardımcı fonksiyonu ──────────────────────────────────────────
function getVideoEmbed(url: string): { type: 'youtube' | 'vimeo' | 'direct'; src: string } | null {
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const id = u.hostname.includes('youtu.be')
        ? u.pathname.slice(1)
        : u.searchParams.get('v') || u.pathname.split('/').pop();
      if (!id) return null;
      return { type: 'youtube', src: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` };
    }
    // Vimeo
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (!id) return null;
      return { type: 'vimeo', src: `https://player.vimeo.com/video/${id}?badge=0&autopause=0` };
    }
    // Direkt video dosyası
    const ext = u.pathname.split('.').pop()?.toLowerCase();
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext || '')) {
      return { type: 'direct', src: url };
    }
    return null;
  } catch {
    return null;
  }
}

const CATEGORIES = [
  { key: 'all', label: 'Tümü', icon: 'https://cdn-icons-png.flaticon.com/128/1828/1828884.png' },
  { key: 'egitim', label: 'Eğitim', icon: 'https://cdn-icons-png.flaticon.com/128/2436/2436874.png' },
  { key: 'kodlama', label: 'Kodlama', icon: 'https://cdn-icons-png.flaticon.com/128/1006/1006363.png' },
  { key: 'akademi', label: 'Akademi', icon: 'https://cdn-icons-png.flaticon.com/128/3135/3135755.png' },
  { key: 'tasarim', label: 'Tasarım', icon: 'https://cdn-icons-png.flaticon.com/128/906/906175.png' },
];

export default function FirebaseExplorePage() {
  const { userProfile } = useFirebaseAuth();
  const [projects, setProjects] = useState<FirestoreProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<FirestoreProject | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    const data = await getProjects();
    setProjects(data);
    setLoading(false);
  }

  // Tüm projelerdeki benzersiz tagleri topla
  const allTags = [...new Set(projects.flatMap(p => p.tags || []))];

  const filtered = projects.filter(p => {
    const matchCat = category === 'all' || p.category === category;
    const matchTag = !activeTag || (p.tags || []).some(t => t.toLowerCase() === activeTag.toLowerCase());
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
    return matchCat && matchTag && matchSearch;
  });

  const handleLike = async (id: string) => {
    if (!userProfile) return;
    await toggleProjectLike(id, userProfile.uid);
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      const likes = p.likes || [];
      return {
        ...p,
        likes: likes.includes(userProfile.uid)
          ? likes.filter(l => l !== userProfile.uid)
          : [...likes, userProfile.uid],
      };
    }));
  };

  if (selectedProject) {
    const liked = userProfile ? (selectedProject.likes || []).includes(userProfile.uid) : false;

    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto bg-gray-900/70 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => setSelectedProject(null)}
            className="m-4 text-sm text-white/60 hover:text-white"
          >
            ← Tum projeler
          </button>

          <div className="relative h-72">
            <img
              src={selectedProject.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80'}
              alt={selectedProject.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-flex px-3 py-1 rounded-full text-xs bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 mb-3">
                {selectedProject.category}
              </span>
              <h1 className="text-3xl font-extrabold text-white">{selectedProject.title}</h1>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-2">
              {selectedProject.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setActiveTag(tag); setSelectedProject(null); }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs hover:bg-indigo-500/25 hover:border-indigo-400/40 transition-all cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="rounded-xl border border-white/10 bg-gray-800/40 p-3">
                <p className="text-white/40 text-xs">Zorluk</p>
                <p className="text-white font-semibold mt-1">{selectedProject.difficulty}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-gray-800/40 p-3">
                <p className="text-white/40 text-xs">Sure</p>
                <p className="text-white font-semibold mt-1">{selectedProject.duration}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-gray-800/40 p-3">
                <p className="text-white/40 text-xs">Begeni</p>
                <p className="text-white font-semibold mt-1">{(selectedProject.likes || []).length}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white mb-2">Proje Aciklamasi</h2>
              <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                {selectedProject.content || selectedProject.description}
              </p>
            </div>

            {/* ─── Video Oynatıcı ─────────────────────────────────────────── */}
            {selectedProject.videoUrl && (() => {
              const embed = getVideoEmbed(selectedProject.videoUrl!);
              return embed ? (
                <div>
                  <h2 className="mb-3 text-lg font-bold text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-400" />
                    Proje Videosu
                  </h2>
                  {embed.type === 'direct' ? (
                    <video
                      src={embed.src}
                      controls
                      className="w-full rounded-2xl border border-white/10 bg-black max-h-80"
                    />
                  ) : (
                    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10" style={{ paddingTop: '56.25%' }}>
                      <iframe
                        src={embed.src}
                        title="Proje Videosu"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-gray-800/40 px-4 py-3">
                  <Video className="w-4 h-4 text-purple-400" />
                  <a href={selectedProject.videoUrl} target="_blank" rel="noopener noreferrer"
                    className="text-purple-400 hover:underline text-sm">
                    Videoyu Aç
                  </a>
                </div>
              );
            })()}

            {!!selectedProject.documents?.length && (
              <div>
                <h2 className="mb-2 text-lg font-bold text-white">Belgeler</h2>
                <div className="space-y-2">
                  {selectedProject.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-gray-800/40 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-300" />
                        <div>
                          <p className="text-sm text-white">{doc.name}</p>
                          <p className="text-xs text-white/50">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <a
                        href={doc.dataUrl}
                        download={doc.name}
                        className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Indir
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {selectedProject.github && (
                <a href={selectedProject.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/80 hover:text-white">
                  <GithubIcon className="w-4 h-4" /> GitHub
                </a>
              )}
              {selectedProject.demo && (
                <a href={selectedProject.demo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/20 px-4 py-2 text-indigo-300 hover:text-indigo-200">
                  <ExternalLink className="w-4 h-4" /> Canli Demo
                </a>
              )}
              <button
                onClick={() => handleLike(selectedProject.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm ${liked ? 'border border-red-500/30 bg-red-500/20 text-red-400' : 'border border-white/10 bg-white/5 text-white/70'}`}
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-red-400' : ''}`} />
                Begen ({(selectedProject.likes || []).length})
              </button>
            </div>

            {/* Yorumlar */}
            <div className="border-t border-white/10 pt-4 mt-6">
              <CommentsSection refType="project" refId={selectedProject.id} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:mb-12 sm:flex-row">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-3">
              <Filter className="w-4 h-4" />
              Topluluk Projeleri
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Projeleri <span className="gradient-text">Keşfet</span>
            </h1>
            <p className="text-white/50 text-sm sm:text-base">Topluluk üyelerinin paylaştığı projeleri incele ve ilham al</p>
          </div>

          {userProfile && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
           >
              <Plus className="h-4 w-4" />
              Proje Ekle
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  category === cat.key
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-gray-800/50 text-white/60 border border-white/10 hover:border-indigo-500/40 hover:text-indigo-400'
                }`}
              >
                <img src={cat.icon} alt={cat.label} className="mr-1 inline-block h-4 w-4" /> {cat.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Proje veya etiket ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-gray-800/50 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Popüler Etiketler */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/50 mr-1">Etiketler:</span>
            {allTags.slice(0, 12).map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(prev => prev === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeTag === tag
                    ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-400/50'
                    : 'bg-gray-800/60 text-white/50 border border-white/10 hover:border-indigo-500/30 hover:text-indigo-400'
                }`}
              >
                #{tag}
              </button>
            ))}
            {activeTag && (
              <button
                onClick={() => setActiveTag(null)}
                className="ml-1 text-xs text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
              >
                Filtreyi temizle
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 border border-white/5 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <img src="https://cdn-icons-png.flaticon.com/128/751/751463.png" alt="arama" className="mx-auto mb-4 h-14 w-14" />
            <h3 className="text-xl font-bold text-white">Proje bulunamadı</h3>
            <p className="text-white/50 mt-2">Farklı bir arama terimi deneyin</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                currentUid={userProfile?.uid}
                onLike={handleLike}
                onOpen={setSelectedProject}
              />
            ))}
          </div>
        )}

        <p className="text-center text-white/30 text-sm mt-8">{filtered.length} proje gösteriliyor</p>
      </div>

      {userProfile && showAddModal && (
        <FirebaseAddProjectModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            void loadProjects();
          }}
        />
      )}
    </div>
  );
}

function ProjectCard({ project, currentUid, onLike, onOpen }: {
  project: FirestoreProject;
  currentUid?: string;
  onLike: (id: string) => void;
  onOpen?: (project: FirestoreProject) => void;
}) {
  const liked = currentUid ? (project.likes || []).includes(currentUid) : false;
  const initials = project.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const coverImages: Record<string, string> = {
    egitim: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
    kodlama: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80',
    akademi: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
    tasarim: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
  };

  const img = project.image || coverImages[project.category] || coverImages.kodlama;

  return (
    <button onClick={() => onOpen?.(project)} className="group w-full text-left bg-gray-800/50 border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300 card-hover">
      <div className="relative h-44 overflow-hidden">
        <img src={img} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="absolute top-3 right-3 flex gap-2">
          {project.videoUrl && (
            <span className="w-8 h-8 bg-purple-600/80 backdrop-blur rounded-full flex items-center justify-center" title="Video mevcut">
              <Video className="w-4 h-4 text-white" />
            </span>
          )}
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="w-8 h-8 bg-black/60 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/80 transition">
              <GithubIcon className="w-4 h-4 text-white" />
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="w-8 h-8 bg-black/60 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/80 transition">
              <ExternalLink className="w-4 h-4 text-white" />
            </a>
          )}
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/30">
            {project.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white mb-1 line-clamp-1 group-hover:text-indigo-400 transition-colors">{project.title}</h3>
        <p className="text-white/50 text-sm line-clamp-2 mb-3">{project.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 text-xs bg-gray-700/50 text-white/50 rounded-lg flex items-center gap-1 hover:bg-indigo-500/15 hover:text-indigo-300 transition-colors">
              <Tag className="w-2.5 h-2.5" />#{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <span className="text-xs text-white/50">{project.displayName}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onLike(project.id); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              liked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-700/50 text-white/40 border border-white/5 hover:border-red-500/30 hover:text-red-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-400' : ''}`} />
            {(project.likes || []).length}
          </button>
        </div>
      </div>
    </button>
  );
}
