import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { categories } from '../data/projects';
import type { ProjectCategory, Project } from '../data/projects';
import { getProjects, FirestoreProject } from '../firebase/firestoreService';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [firestoreProjects, setFirestoreProjects] = useState<FirestoreProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const data = await getProjects();
    setFirestoreProjects(data);
    setLoading(false);
  };

  const adaptedProjects: Project[] = firestoreProjects.map((p, index) => ({
    id: index + 1,
    title: p.title,
    description: p.description,
    category: p.category as ProjectCategory,
    tags: p.tags,
    image:
      p.image ||
      (p.category === 'egitim'
        ? 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80'
        : p.category === 'akademi'
        ? 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80'
        : p.category === 'tasarim'
        ? 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80'
        : 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80'),
    date: p.createdAt || new Date().toISOString(),
    difficulty: (p.difficulty as Project['difficulty']) || 'Orta',
    duration: p.duration || '1 ay',
    github: p.github,
    demo: p.demo,
    featured: false,
  }));

  const filteredProjects = adaptedProjects.filter((project) => {
    const matchCategory = activeCategory === 'all' || project.category === activeCategory;
    const matchSearch =
      searchQuery === '' ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <section id="projects" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-sm font-semibold">
            <Filter className="w-4 h-4" />
            Projelerim
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Tüm <span className="gradient-text">Projeler</span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Eğitim, kodlama, akademi ve tasarım alanlarında geliştirdiğim projeleri keşfedin
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-10">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeCategory === cat.key
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-gray-800/50 text-white/60 border border-white/10 hover:border-indigo-500/40 hover:text-indigo-400'
                }`}
              >
                <img src={cat.emoji} alt={cat.label} className="mr-1.5 inline-block h-4 w-4" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Proje ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-gray-800/50 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-2xl border border-white/5 bg-gray-800/50 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={setSelectedProject}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <img
              src="https://cdn-icons-png.flaticon.com/128/751/751463.png"
              alt="search"
              className="mx-auto mb-4 h-12 w-12"
            />
            <h3 className="text-xl font-bold text-white">Henuz proje yok</h3>
            <p className="text-white/50 mt-2">Ilk projeyi eklemek icin giris yapip "Proje Ekle" ozelligini kullanin.</p>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-8 text-center text-sm text-white/30">
          {filteredProjects.length} proje gösteriliyor
        </div>
      </div>

      {/* Modal */}
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </section>
  );
}
