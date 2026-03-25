import { useState, useEffect } from 'react';
import {
  ArrowLeft, Settings, Plus, BookOpen, FolderOpen, Heart, Eye, Calendar,
  ExternalLink, Edit3, Trash2, Tag, Clock
} from 'lucide-react';
import { GithubIcon, TwitterIcon } from './icons';
import { useAuth } from '../store/AuthContext';
import { User, UserProject, BlogPost } from '../types';
import * as db from '../store/db';
import AddProjectModal from './AddProjectModal';
import BlogEditor from './BlogEditor';
import BlogDetailView from './BlogDetailView';
import ProfileEditor from './ProfileEditor';

interface UserProfileProps {
  username: string;
  onBack: () => void;
}

const categoryLabels: Record<string, string> = {
  egitim: '📚 Eğitim',
  kodlama: '💻 Kodlama',
  akademi: '🎓 Akademi',
  tasarim: '🎨 Tasarım',
};

const difficultyColors: Record<string, string> = {
  'Başlangıç': 'bg-green-100 text-green-700',
  'Orta': 'bg-yellow-100 text-yellow-700',
  'İleri': 'bg-red-100 text-red-700',
};

export default function UserProfile({ username, onBack }: UserProfileProps) {
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'blogs'>('projects');
  const [showAddProject, setShowAddProject] = useState(false);
  const [showBlogEditor, setShowBlogEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [viewingBlog, setViewingBlog] = useState<BlogPost | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const isOwner = currentUser?.username === username;

  useEffect(() => {
    loadUserData();
  }, [username]);

  const loadUserData = () => {
    const user = db.getUserByUsername(username);
    if (user) {
      setProfileUser(user);
      setProjects(db.getProjectsByUser(user.id));
      setBlogs(db.getBlogsByUser(user.id));
    }
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      if (currentUser) db.deleteProject(id, currentUser.id);
      loadUserData();
    }
  };

  const handleDeleteBlog = (id: string) => {
    if (confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
      if (currentUser) db.deleteBlog(id, currentUser.id);
      loadUserData();
    }
  };

  const handleLikeProject = (id: string) => {
    db.likeProject(id);
    loadUserData();
  };

  const handleLikeBlog = (id: string) => {
    db.likeBlog(id);
    loadUserData();
  };

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Kullanıcı Bulunamadı</h2>
          <p className="text-slate-500 mb-6">"{username}" kullanıcı adına sahip bir hesap bulunamadı.</p>
          <button onClick={onBack} className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition">
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  if (viewingBlog) {
    return (
      <BlogDetailView
        blog={viewingBlog}
        author={profileUser}
        onBack={() => { setViewingBlog(null); loadUserData(); }}
        onLike={() => { handleLikeBlog(viewingBlog.id); setViewingBlog({ ...viewingBlog, likes: viewingBlog.likes + 1 }); }}
        isOwner={isOwner}
        onEdit={() => { setEditingBlog(viewingBlog); setViewingBlog(null); setShowBlogEditor(true); }}
        onDelete={() => { handleDeleteBlog(viewingBlog.id); setViewingBlog(null); }}
      />
    );
  }

  const initials = profileUser.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-24">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Ana Sayfa</span>
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/30 shrink-0">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">{profileUser.displayName}</h1>
                  <p className="text-indigo-500 font-medium">@{profileUser.username}</p>
                </div>
                {isOwner && (
                  <button
                    onClick={() => setShowProfileEditor(true)}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition text-sm font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    Profili Düzenle
                  </button>
                )}
              </div>
              {profileUser.bio && (
                <p className="text-slate-500 mt-2 max-w-xl">{profileUser.bio}</p>
              )}

              {/* Skills */}
              {profileUser.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profileUser.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Social & Stats */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <FolderOpen className="w-4 h-4" />
                  {projects.length} proje
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {blogs.length} blog
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(profileUser.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })} tarihinde katıldı
                </span>
                {profileUser.github && (
                  <a href={profileUser.github} target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition">
                    <GithubIcon className="w-5 h-5" />
                  </a>
                )}
                {profileUser.twitter && (
                  <a href={profileUser.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition">
                    <TwitterIcon className="w-5 h-5" />
                  </a>
                )}
                {profileUser.website && (
                  <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-500 transition">
                    <ExternalLink className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-8 mb-6">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'projects'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Projeler ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('blogs')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'blogs'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Blog Yazıları ({blogs.length})
          </button>

          {isOwner && (
            <button
              onClick={() => activeTab === 'projects' ? setShowAddProject(true) : (setEditingBlog(null), setShowBlogEditor(true))}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'projects' ? 'Proje Ekle' : 'Blog Yaz'}
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'projects' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {projects.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="text-5xl mb-4">📂</div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Henüz proje yok</h3>
                <p className="text-slate-400">
                  {isOwner ? 'İlk projenizi ekleyerek başlayın!' : 'Bu kullanıcı henüz proje paylaşmamış.'}
                </p>
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm card-hover group">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold rounded-full">
                        {categoryLabels[project.category]}
                      </span>
                    </div>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <button
                          onClick={() => handleLikeProject(project.id)}
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
                        {isOwner && (
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6 pb-16">
            {blogs.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Henüz blog yazısı yok</h3>
                <p className="text-slate-400">
                  {isOwner ? 'İlk blog yazınızı yazarak başlayın!' : 'Bu kullanıcı henüz blog yazmamış.'}
                </p>
              </div>
            ) : (
              blogs.map((blog) => (
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
                      <div className="flex items-center justify-between">
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
                        {isOwner && (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => { setEditingBlog(blog); setShowBlogEditor(true); }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-500 transition"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(blog.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddProject && (
        <AddProjectModal
          onClose={() => setShowAddProject(false)}
          onSaved={() => { setShowAddProject(false); loadUserData(); }}
        />
      )}
      {showBlogEditor && (
        <BlogEditor
          existingBlog={editingBlog}
          onClose={() => { setShowBlogEditor(false); setEditingBlog(null); }}
          onSaved={() => { setShowBlogEditor(false); setEditingBlog(null); loadUserData(); }}
        />
      )}
      {showProfileEditor && (
        <ProfileEditor
          onClose={() => { setShowProfileEditor(false); loadUserData(); }}
        />
      )}
    </div>
  );
}
