import { useState, useEffect } from 'react';
import { Search, ArrowLeft, Heart, Eye, Calendar, Tag, BookOpen, User } from 'lucide-react';
import { BlogPost, User as UserType } from '../types';
import * as db from '../store/db';
import BlogDetailView from './BlogDetailView';
import { useAuth } from '../store/AuthContext';

interface BlogsPageProps {
  onBack: () => void;
  onViewProfile: (username: string) => void;
}

export default function BlogsPage({ onBack, onViewProfile }: BlogsPageProps) {
  const { user: currentUser } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState('');
  const [viewingBlog, setViewingBlog] = useState<BlogPost | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBlogs(db.getAllBlogs());
    setUsers(db.getUsers());
  };

  const getUser = (userId: string) => users.find((u) => u.id === userId);

  const filteredBlogs = blogs.filter(
    (b) =>
      search === '' ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (viewingBlog) {
    const author = getUser(viewingBlog.userId);
    if (!author) return null;
    const isOwner = currentUser?.id === viewingBlog.userId;
    return (
      <BlogDetailView
        blog={viewingBlog}
        author={author}
        onBack={() => { setViewingBlog(null); loadData(); }}
        onLike={() => { db.likeBlog(viewingBlog.id); setViewingBlog({ ...viewingBlog, likes: viewingBlog.likes + 1 }); }}
        isOwner={isOwner}
        onEdit={() => {}}
        onDelete={() => { if (currentUser) db.deleteBlog(viewingBlog.id, currentUser.id); setViewingBlog(null); loadData(); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 pb-32 pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Ana Sayfa</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Topluluk Blogları</h1>
          </div>
          <p className="text-white/70 max-w-lg">
            Topluluğun paylaştığı tüm blog yazılarını keşfedin.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Blog yazısı ara..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-4 font-medium">{filteredBlogs.length} yazı bulundu</p>

        <div className="space-y-6 pb-16">
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Blog yazısı bulunamadı</h3>
              <p className="text-slate-400">Farklı anahtar kelimeler deneyin.</p>
            </div>
          ) : (
            filteredBlogs.map((blog) => {
              const author = getUser(blog.userId);
              const initials = author?.displayName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || '??';

              return (
                <div
                  key={blog.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => { db.incrementBlogViews(blog.id); setViewingBlog({ ...blog, views: blog.views + 1 }); }}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-64 h-48 sm:h-auto shrink-0 overflow-hidden">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {blog.tags.map((tag) => (
                          <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2 hover:text-indigo-600 transition">
                        {blog.title}
                      </h3>
                      <p className="text-slate-500 text-sm mb-4 line-clamp-2">{blog.excerpt}</p>
                      {/* Author */}
                      {author && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onViewProfile(author.username); }}
                          className="flex items-center gap-2 mb-3 group/author"
                        >
                          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                            {initials}
                          </div>
                          <span className="text-sm text-slate-500 group-hover/author:text-indigo-500 transition font-medium flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {author.displayName}
                          </span>
                        </button>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(blog.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {blog.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {blog.views}
                        </span>
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
