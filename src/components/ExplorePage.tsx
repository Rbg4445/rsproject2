import { useState, useEffect } from 'react';
import { Search, Heart, Clock, ExternalLink, ArrowLeft, Filter, Users } from 'lucide-react';
import { GithubIcon } from './icons';
import { UserProject } from '../types';
import { User } from '../types';
import * as db from '../store/db';

interface ExplorePageProps {
  onBack: () => void;
  onViewProfile: (username: string) => void;
}

const categoryFilters = [
  { key: 'all', label: 'Tümü', emoji: '🌟' },
  { key: 'egitim', label: 'Eğitim', emoji: '📚' },
  { key: 'kodlama', label: 'Kodlama', emoji: '💻' },
  { key: 'akademi', label: 'Akademi', emoji: '🎓' },
  { key: 'tasarim', label: 'Tasarım', emoji: '🎨' },
];

const difficultyColors: Record<string, string> = {
  'Başlangıç': 'bg-green-100 text-green-700',
  'Orta': 'bg-yellow-100 text-yellow-700',
  'İleri': 'bg-red-100 text-red-700',
};

export default function ExplorePage({ onBack, onViewProfile }: ExplorePageProps) {
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    setProjects(db.getAllProjects());
    setUsers(db.getUsers());
  }, []);

  const getUser = (userId: string) => users.find((u) => u.id === userId);

  const filteredProjects = projects.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleLike = (id: string) => {
    db.likeProject(id);
    setProjects(db.getAllProjects());
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 pb-32 pt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Ana Sayfa</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Topluluk Projeleri</h1>
          </div>
          <p className="text-white/70 max-w-lg">
            Topluluğun paylaştığı tüm projeleri keşfedin, beğenin ve ilham alın.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Proje ara... (başlık, açıklama, etiket)"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex gap-1.5 overflow-x-auto">
                {categoryFilters.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                      activeCategory === cat.key
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-400 mb-4 font-medium">
          {filteredProjects.length} proje bulundu
        </p>

        {/* Projects Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Proje bulunamadı</h3>
              <p className="text-slate-400">Farklı anahtar kelimeler veya kategoriler deneyin.</p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const author = getUser(project.userId);
              const initials = author?.displayName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || '??';

              return (
                <div key={project.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm card-hover group">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${difficultyColors[project.difficulty]}`}>
                        {project.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-800 mb-2 line-clamp-1">{project.title}</h3>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-md font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {/* Author */}
                    {author && (
                      <button
                        onClick={() => onViewProfile(author.username)}
                        className="flex items-center gap-2 mb-3 group/author"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {initials}
                        </div>
                        <span className="text-sm text-slate-500 group-hover/author:text-indigo-500 transition font-medium">
                          {author.displayName}
                        </span>
                      </button>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <button
                          onClick={() => handleLike(project.id)}
                          className="flex items-center gap-1 hover:text-red-500 transition"
                        >
                          <Heart className="w-4 h-4" />
                          {project.likes}
                        </button>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {project.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {project.github && (
                          <a href={project.github} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
                            <GithubIcon className="w-4 h-4" />
                          </a>
                        )}
                        {project.demo && (
                          <a href={project.demo} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-500 transition">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
