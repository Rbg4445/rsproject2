import { X, ExternalLink, Clock, Signal, Calendar } from 'lucide-react';
import { GithubIcon } from './icons';
import type { Project } from '../data/projects';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

const difficultyColor = {
  'Başlangıç': 'bg-green-500/20 text-green-400',
  'Orta': 'bg-yellow-500/20 text-yellow-400',
  'İleri': 'bg-red-500/20 text-red-400',
};

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-gray-900 border border-white/10 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-800 border border-white/10 rounded-full flex items-center justify-center hover:bg-gray-700 transition"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>

        {/* Image */}
        <div className="relative h-64 sm:h-72">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover rounded-t-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent rounded-t-3xl" />

          {project.featured && (
            <div className="absolute top-4 left-4 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
              ⭐ Öne Çıkan Proje
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {project.title}
            </h2>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${difficultyColor[project.difficulty]}`}>
                <Signal className="w-3.5 h-3.5" />
                {project.difficulty}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-gray-700/50 text-white/60">
                <Clock className="w-3.5 h-3.5" />
                {project.duration}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-gray-700/50 text-white/60">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(project.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          <p className="text-white/60 leading-relaxed text-base">
            {project.description}
          </p>

          <div>
            <h4 className="text-sm font-semibold text-white/30 uppercase tracking-wider mb-3">
              Teknolojiler
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 text-sm font-medium bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {project.github && (
              <a
                href={project.github}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-700 border border-white/10 text-white font-semibold rounded-xl hover:bg-gray-600 transition"
              >
                <GithubIcon className="w-5 h-5" />
                GitHub
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition"
              >
                <ExternalLink className="w-5 h-5" />
                Canlı Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
