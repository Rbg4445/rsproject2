import { ExternalLink, Clock, Signal } from 'lucide-react';
import { GithubIcon } from './icons';
import type { Project } from '../data/projects';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

const difficultyColor = {
  'Başlangıç': 'bg-green-100 text-green-700',
  'Orta': 'bg-yellow-100 text-yellow-700',
  'İleri': 'bg-red-100 text-red-700',
};

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <div
      onClick={() => onClick(project)}
      className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden card-hover cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {project.featured && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
            ⭐ Öne Çıkan
          </div>
        )}

        <div className="absolute top-3 right-3 flex gap-2">
          {project.github && (
            <a
              href={project.github}
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition shadow-md"
            >
              <GithubIcon className="w-4 h-4 text-slate-700" />
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition shadow-md"
            >
              <ExternalLink className="w-4 h-4 text-slate-700" />
            </a>
          )}
        </div>

        <div className="absolute bottom-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${difficultyColor[project.difficulty]}`}>
            <Signal className="w-3 h-3 inline mr-1" />
            {project.difficulty}
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-white/90 text-slate-600">
            <Clock className="w-3 h-3 inline mr-1" />
            {project.duration}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {project.title}
        </h3>
        <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-lg"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2.5 py-1 text-xs font-medium bg-slate-50 text-slate-400 rounded-lg">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
