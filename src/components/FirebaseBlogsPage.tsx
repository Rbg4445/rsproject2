import { useState, useEffect } from 'react';
import { Search, Heart, Eye, Loader } from 'lucide-react';
import { getAllBlogs, FirestoreBlog, toggleBlogLike, incrementBlogViews } from '../firebase/firestoreService';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';

interface Props {
  onOpenBlog?: (blog: FirestoreBlog) => void;
}

export default function FirebaseBlogsPage({ onOpenBlog }: Props) {
  const { firebaseUser } = useFirebaseAuth();
  const [blogs, setBlogs] = useState<FirestoreBlog[]>([]);
  const [filtered, setFiltered] = useState<FirestoreBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<FirestoreBlog | null>(null);

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    let result = blogs.filter((b) => b.status === 'active');
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)) ||
          b.authorUsername.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [blogs, search]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await getAllBlogs();
      setBlogs(data);
    } catch (err) {
      console.error('Bloglar yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (blog: FirestoreBlog, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firebaseUser) return;
    setLikeLoading(blog.id);
    const liked = blog.likedBy?.includes(firebaseUser.uid);
    try {
      await toggleBlogLike(blog.id, firebaseUser.uid, liked);
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blog.id
            ? {
                ...b,
                likes: liked ? b.likes - 1 : b.likes + 1,
                likedBy: liked
                  ? b.likedBy.filter((id) => id !== firebaseUser.uid)
                  : [...(b.likedBy || []), firebaseUser.uid],
              }
            : b
        )
      );
    } finally {
      setLikeLoading(null);
    }
  };

  const handleOpenBlog = async (blog: FirestoreBlog) => {
    await incrementBlogViews(blog.id);
    setSelectedBlog(blog);
    if (onOpenBlog) onOpenBlog(blog);
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-6 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic text-white/80">$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-white/10 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-white/70 mb-1">• $1</li>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-indigo-400 hover:underline" target="_blank">$1</a>')
      .replace(/\n\n/g, '</p><p class="mb-4 text-white/70">')
      .replace(/\n/g, '<br/>');
  };

  if (selectedBlog) {
    const isLiked = firebaseUser && selectedBlog.likedBy?.includes(firebaseUser.uid);
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedBlog(null)}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm"
          >
            ← Bloglar'a dön
          </button>

          {selectedBlog.coverImage && (
            <img
              src={selectedBlog.coverImage}
              alt={selectedBlog.title}
              className="w-full h-72 object-cover rounded-2xl mb-8"
            />
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {selectedBlog.tags.map((tag) => (
              <span key={tag} className="bg-purple-600/20 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-500/20">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl font-black text-white mb-4">{selectedBlog.title}</h1>

          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
              {selectedBlog.authorAvatar ? (
                <img src={selectedBlog.authorAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                selectedBlog.authorName?.[0]?.toUpperCase() || '?'
              )}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{selectedBlog.authorName}</p>
              <p className="text-white/40 text-xs">@{selectedBlog.authorUsername}</p>
            </div>
            <div className="ml-auto flex items-center gap-4 text-white/40 text-sm">
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {selectedBlog.views + 1}</span>
              <button
                onClick={(e) => handleLike(selectedBlog, e)}
                disabled={!firebaseUser || likeLoading === selectedBlog.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  isLiked
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                    : 'hover:text-pink-400 border border-white/10 hover:border-pink-500/30'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {selectedBlog.likes}
              </button>
            </div>
          </div>

          <div
            className="text-white/70 leading-relaxed space-y-2"
            dangerouslySetInnerHTML={{ __html: `<p class="mb-4 text-white/70">${renderMarkdown(selectedBlog.content)}</p>` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Başlık */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-3">
            📚 Topluluk <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Blogları</span>
          </h1>
          <p className="text-white/50">{blogs.filter(b => b.status === 'active').length} blog yazısı paylaşıldı</p>
        </div>

        {/* Arama */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Blog, etiket veya yazar ara..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader className="w-12 h-12 text-purple-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 text-white/30">
            <p className="text-lg">Blog yazısı bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((blog) => {
              const isLiked = firebaseUser && blog.likedBy?.includes(firebaseUser.uid);
              return (
                <div
                  key={blog.id}
                  onClick={() => handleOpenBlog(blog)}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/8 transition-all cursor-pointer group"
                >
                  <div className="flex gap-5 p-5">
                    {blog.coverImage && (
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-32 h-24 object-cover rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {blog.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-purple-400/70 text-xs">#{tag}</span>
                        ))}
                      </div>
                      <h3 className="text-white font-bold text-lg mb-1 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-white/50 text-sm line-clamp-2 mb-3">{blog.excerpt}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs overflow-hidden">
                            {blog.authorAvatar ? (
                              <img src={blog.authorAvatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              blog.authorName?.[0]?.toUpperCase() || '?'
                            )}
                          </div>
                          <span className="text-white/40 text-xs">@{blog.authorUsername}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views}</span>
                          <button
                            onClick={(e) => handleLike(blog, e)}
                            disabled={!firebaseUser || likeLoading === blog.id}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                              isLiked
                                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                                : 'hover:text-pink-400 border border-white/10'
                            } disabled:opacity-50`}
                          >
                            {likeLoading === blog.id ? (
                              <Loader className="w-3 h-3 animate-spin" />
                            ) : (
                              <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                            )}
                            {blog.likes}
                          </button>
                        </div>
                      </div>
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
