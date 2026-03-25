import { ArrowLeft, Heart, Eye, Calendar, Tag, Edit3, Trash2, Share2, User } from 'lucide-react';
import { BlogPost } from '../types';
import { User as UserType } from '../types';

interface BlogDetailViewProps {
  blog: BlogPost;
  author: UserType;
  onBack: () => void;
  onLike: () => void;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function renderMarkdown(text: string): string {
  let html = text
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-slate-900 text-green-400 rounded-xl p-4 my-4 overflow-x-auto text-sm font-mono"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-slate-800 mt-6 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-slate-800 mt-8 mb-4 pb-2 border-b border-slate-200">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-slate-800 mt-8 mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-slate-600 mb-1">• $1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="text-slate-600 leading-relaxed mb-4">')
    // Line breaks
    .replace(/\n/g, '<br/>');

  return '<p class="text-slate-600 leading-relaxed mb-4">' + html + '</p>';
}

export default function BlogDetailView({ blog, author, onBack, onLike, isOwner, onEdit, onDelete }: BlogDetailViewProps) {
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
  };

  const initials = author.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cover */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute top-6 left-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Geri
          </button>
        </div>
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              {blog.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">{blog.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Author bar */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
              {initials}
            </div>
            <div>
              <div className="font-semibold text-slate-800 flex items-center gap-1">
                <User className="w-4 h-4 text-slate-400" />
                {author.displayName}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(blog.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onLike}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition text-sm font-medium"
            >
              <Heart className="w-4 h-4" />
              {blog.likes}
            </button>
            <span className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-medium">
              <Eye className="w-4 h-4" />
              {blog.views}
            </span>
            <button
              onClick={handleShare}
              className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {isOwner && (
              <>
                <button onClick={onEdit} className="p-2 bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-100 transition">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={onDelete} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Blog content */}
        <article
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content) }}
        />
      </div>
    </div>
  );
}
