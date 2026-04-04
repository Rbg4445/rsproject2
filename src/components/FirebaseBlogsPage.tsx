import { useState, useEffect } from 'react';
import { Search, Heart, Eye, BookOpen, Tag, Plus } from 'lucide-react';
import { getBlogs, toggleBlogLike, FirestoreBlog } from '../firebase/firestoreService';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import FirebaseBlogEditor from './FirebaseBlogEditor';

export default function FirebaseBlogsPage() {
  const { userProfile } = useFirebaseAuth();
  const [blogs, setBlogs] = useState<FirestoreBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<FirestoreBlog | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  async function loadBlogs() {
    setLoading(true);
    const data = await getBlogs();
    setBlogs(data);
    setLoading(false);
  }

  // Tüm bloglardaki benzersiz tagleri topla
  const allTags = [...new Set(blogs.flatMap(b => b.tags || []))];

  const filtered = blogs.filter(b => {
    const matchTag = !activeTag || (b.tags || []).some(t => t.toLowerCase() === activeTag.toLowerCase());
    const q = search.toLowerCase();
    const matchSearch = !q || b.title.toLowerCase().includes(q) || b.summary.toLowerCase().includes(q) || b.tags.some(t => t.toLowerCase().includes(q));
    return matchTag && matchSearch;
  });

  const handleLike = async (id: string) => {
    if (!userProfile) return;
    await toggleBlogLike(id, userProfile.uid);
    setBlogs(prev => prev.map(b => {
      if (b.id !== id) return b;
      const likes = b.likes || [];
      return {
        ...b,
        likes: likes.includes(userProfile.uid)
          ? likes.filter(l => l !== userProfile.uid)
          : [...likes, userProfile.uid],
      };
    }));
  };

  if (selected) {
    return <BlogDetail blog={selected} onBack={() => setSelected(null)} currentUid={userProfile?.uid} onLike={handleLike} onTagClick={(tag) => { setActiveTag(tag); setSelected(null); }} />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:mb-12 sm:flex-row">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-3">
              <BookOpen className="w-4 h-4" />
              Topluluk Blogları
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Blog <span className="gradient-text">Yazıları</span>
            </h1>
            <p className="text-white/50 text-sm sm:text-base">Topluluk üyelerinin paylaştığı blog yazılarını oku</p>
          </div>

          {userProfile && (
            <button
              onClick={() => setShowEditor(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40"
            >
              <Plus className="h-4 w-4" />
              Blog Yaz
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80 mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Blog ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-gray-800/50 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Popüler Etiketler */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/50 mr-1">Etiketler:</span>
            {allTags.slice(0, 10).map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(prev => prev === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeTag === tag
                    ? 'bg-purple-500/25 text-purple-300 border border-purple-400/50'
                    : 'bg-gray-800/60 text-white/50 border border-white/10 hover:border-purple-500/30 hover:text-purple-400'
                }`}
              >
                #{tag}
              </button>
            ))}
            {activeTag && (
              <button
                onClick={() => setActiveTag(null)}
                className="ml-1 text-xs text-purple-400 underline underline-offset-4 hover:text-purple-300"
              >
                Filtreyi temizle
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-800/50 border border-white/5 rounded-2xl h-72 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <img
              src="https://cdn-icons-png.flaticon.com/128/2991/2991112.png"
              alt="blog"
              className="mx-auto mb-4 h-14 w-14"
            />
            <h3 className="text-xl font-bold text-white">Blog yazısı bulunamadı</h3>
            <p className="text-white/50 mt-2">Henüz blog yazısı paylaşılmamış</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(blog => (
              <BlogCard key={blog.id} blog={blog} currentUid={userProfile?.uid} onLike={handleLike} onClick={() => setSelected(blog)} />
            ))}
          </div>
        )}
        <p className="text-center text-white/30 text-sm mt-8">{filtered.length} blog yazısı</p>
      </div>

      {userProfile && showEditor && (
        <FirebaseBlogEditor
          onClose={() => setShowEditor(false)}
          onSuccess={() => {
            void loadBlogs();
          }}
        />
      )}
    </div>
  );
}

function BlogCard({ blog, currentUid, onLike, onClick }: {
  blog: FirestoreBlog;
  currentUid?: string;
  onLike: (id: string) => void;
  onClick: () => void;
}) {
  const liked = currentUid ? (blog.likes || []).includes(currentUid) : false;
  const initials = blog.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const coverImages = [
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80',
    'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&q=80',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80',
  ];
  const img = blog.coverImage || coverImages[blog.id.charCodeAt(5) % 3];

  return (
    <div onClick={onClick} className="group bg-gray-800/50 border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300 card-hover cursor-pointer">
      <div className="relative h-44 overflow-hidden">
        <img src={img} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white mb-1 line-clamp-2 group-hover:text-indigo-400 transition-colors">{blog.title}</h3>
        <p className="text-white/50 text-sm line-clamp-2 mb-3">{blog.summary}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {blog.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 text-xs bg-gray-700/50 text-white/50 rounded-lg flex items-center gap-1 hover:bg-purple-500/15 hover:text-purple-300 transition-colors">
              <Tag className="w-2.5 h-2.5" />#{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <span className="text-xs text-white/50">{blog.displayName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-white/30">
              <Eye className="w-3.5 h-3.5" />{blog.views || 0}
            </span>
            <button
              onClick={e => { e.stopPropagation(); onLike(blog.id); }}
              className={`flex items-center gap-1 text-xs font-medium transition-all ${liked ? 'text-red-400' : 'text-white/30 hover:text-red-400'}`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-400' : ''}`} />
              {(blog.likes || []).length}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlogDetail({ blog, onBack, currentUid, onLike, onTagClick }: {
  blog: FirestoreBlog;
  onBack: () => void;
  currentUid?: string;
  onLike: (id: string) => void;
  onTagClick?: (tag: string) => void;
}) {
  const liked = currentUid ? (blog.likes || []).includes(currentUid) : false;
  const initials = blog.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
          ← Geri dön
        </button>

        {blog.coverImage && (
          <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
            <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
          </div>
        )}

        <h1 className="text-3xl font-extrabold text-white mb-4">{blog.title}</h1>

        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
              {initials}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{blog.displayName}</p>
              <p className="text-white/40 text-xs">@{blog.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <span className="flex items-center gap-1 text-sm text-white/40"><Eye className="w-4 h-4" />{blog.views || 0}</span>
            <button
              onClick={() => onLike(blog.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${liked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-700/50 text-white/40 border border-white/5 hover:text-red-400'}`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-400' : ''}`} />
              {(blog.likes || []).length}
            </button>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="text-white/70 leading-relaxed whitespace-pre-wrap">{blog.content}</div>
        </div>

        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/10">
          {blog.tags.map(tag => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className="px-3 py-1 text-sm bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-400/40 transition-all cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
