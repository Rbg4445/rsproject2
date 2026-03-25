import { useState, useEffect } from 'react';
import { Search, Filter, Heart, ExternalLink, Tag } from 'lucide-react';
import { getProjects, toggleProjectLike, FirestoreProject } from '../firebase/firestoreService';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import { GithubIcon } from './icons';

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

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    const data = await getProjects();
    setProjects(data);
    setLoading(false);
  }

  const filtered = projects.filter(p => {
    const matchCat = category === 'all' || p.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
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

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-4">
            <Filter className="w-4 h-4" />
            Topluluk Projeleri
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">
            Projeleri <span className="gradient-text">Keşfet</span>
          </h1>
          <p className="text-white/50">Topluluk üyelerinin paylaştığı projeleri incele ve ilham al</p>
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
              placeholder="Proje ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-gray-800/50 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

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
              />
            ))}
          </div>
        )}

        <p className="text-center text-white/30 text-sm mt-8">{filtered.length} proje gösteriliyor</p>
      </div>
    </div>
  );
}

function ProjectCard({ project, currentUid, onLike }: {
  project: FirestoreProject;
  currentUid?: string;
  onLike: (id: string) => void;
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
    <div className="group bg-gray-800/50 border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300 card-hover">
      <div className="relative h-44 overflow-hidden">
        <img src={img} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="absolute top-3 right-3 flex gap-2">
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
            <span key={tag} className="px-2 py-0.5 text-xs bg-gray-700/50 text-white/50 rounded-lg flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />{tag}
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
            onClick={() => onLike(project.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              liked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-700/50 text-white/40 border border-white/5 hover:border-red-500/30 hover:text-red-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-400' : ''}`} />
            {(project.likes || []).length}
          </button>
        </div>
      </div>
    </div>
  );
}
