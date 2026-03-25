import { useState, useEffect, useRef } from 'react';
import { Link as LinkIcon, Edit3, Trash2, Eye, Heart, Camera, Loader, Plus, BookOpen, FolderOpen } from 'lucide-react';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import { getUserProjects, getUserBlogs, deleteProject, deleteBlog, FirestoreProject, FirestoreBlog } from '../firebase/firestoreService';
import { uploadAvatar } from '../firebase/storageService';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { auth } from '../firebase/config';
import FirebaseAddProjectModal from './FirebaseAddProjectModal';
import FirebaseBlogEditor from './FirebaseBlogEditor';

interface Props {
  username?: string;
  onNavigate?: (page: string, data?: unknown) => void;
}

export default function FirebaseUserProfile({ username }: Props) {
  const { firebaseUser, userProfile, updateProfile, refreshProfile } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState<'projects' | 'blogs'>('projects');
  const [projects, setProjects] = useState<FirestoreProject[]>([]);
  const [blogs, setBlogs] = useState<FirestoreBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showBlogEditor, setShowBlogEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState<FirestoreBlog | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = !username || username === userProfile?.username;
  const displayProfile = isOwnProfile ? userProfile : null;

  useEffect(() => {
    loadData();
  }, [firebaseUser, username]);

  const loadData = async () => {
    setLoading(true);
    try {
      const targetUid = firebaseUser?.uid;
      if (!targetUid) return;

      const [p, b] = await Promise.all([
        getUserProjects(targetUid),
        getUserBlogs(targetUid),
      ]);
      setProjects(p);
      setBlogs(b);
    } catch (err) {
      console.error('Veri yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;

    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(firebaseUser.uid, file, (p) => {
        setAvatarProgress(p.progress);
      });
      await updateFirebaseProfile(auth.currentUser!, { photoURL: url });
      await updateProfile({ avatar: url });
      await refreshProfile();
    } catch (err) {
      console.error('Avatar yüklenemedi:', err);
    } finally {
      setAvatarUploading(false);
      setAvatarProgress(0);
    }
  };

  const startEdit = () => {
    setEditBio(userProfile?.bio || '');
    setEditSkills(userProfile?.skills?.join(', ') || '');
    setEditGithub(userProfile?.github || '');
    setEditWebsite(userProfile?.website || '');
    setEditTwitter(userProfile?.twitter || '');
    setIsEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await updateProfile({
        bio: editBio,
        skills: editSkills.split(',').map((s) => s.trim()).filter(Boolean),
        github: editGithub,
        website: editWebsite,
        twitter: editTwitter,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Profil kaydedilemedi:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return;
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) return;
    await deleteBlog(id);
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  };

  const profile = displayProfile;
  if (!profile && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white/50">
          <div className="text-6xl mb-4">👤</div>
          <p>Kullanıcı bulunamadı.</p>
        </div>
      </div>
    );
  }

  const initials = profile?.displayName?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profil Kartı */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl border-4 border-gray-900 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt={profile.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-2xl font-bold">{initials}</span>
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                      <Loader className="w-6 h-6 text-white animate-spin" />
                      <span className="text-white text-xs mt-1">{Math.round(avatarProgress)}%</span>
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <>
                    <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg transition-colors shadow-lg"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>

              {/* Düzenle Butonu */}
              {isOwnProfile && !isEditing && (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all text-sm border border-white/10"
                >
                  <Edit3 className="w-4 h-4" /> Profili Düzenle
                </button>
              )}
            </div>

            {/* Profil Bilgileri */}
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-white/50 text-xs">Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs">Yetenekler (virgülle ayır)</label>
                  <input
                    type="text"
                    value={editSkills}
                    onChange={(e) => setEditSkills(e.target.value)}
                    placeholder="React, Python, TypeScript..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all mt-1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-white/50 text-xs">GitHub</label>
                    <input value={editGithub} onChange={(e) => setEditGithub(e.target.value)} placeholder="github.com/..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 mt-1" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs">Website</label>
                    <input value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 mt-1" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs">Twitter</label>
                    <input value={editTwitter} onChange={(e) => setEditTwitter(e.target.value)} placeholder="@kullanıcıadı" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 mt-1" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setIsEditing(false)} className="flex-1 bg-white/5 text-white/70 py-2 rounded-xl border border-white/10 text-sm">İptal</button>
                  <button onClick={saveEdit} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                    {saving ? <><Loader className="w-4 h-4 animate-spin" /> Kaydediliyor...</> : '✓ Kaydet'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-white text-xl font-bold">{profile?.displayName}</h1>
                  {profile?.role === 'admin' && (
                    <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-500/30">Admin</span>
                  )}
                  {profile?.role === 'moderator' && (
                    <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-500/30">Moderatör</span>
                  )}
                </div>
                <p className="text-white/50 text-sm mb-3">@{profile?.username}</p>
                {profile?.bio && <p className="text-white/70 text-sm mb-4">{profile.bio}</p>}

                {/* Meta bilgiler */}
                <div className="flex flex-wrap gap-4 text-white/40 text-xs mb-4">
                  {profile?.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                      <LinkIcon className="w-3 h-3" /> {profile.website.replace('https://', '')}
                    </a>
                  )}
                  {profile?.github && (
                    <a href={`https://${profile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                      <span>⭐</span> {profile.github}
                    </a>
                  )}
                  {profile?.twitter && (
                    <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                      <span>🐦</span> {profile.twitter}
                    </a>
                  )}
                </div>

                {/* Yetenekler */}
                {profile?.skills && profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span key={skill} className="bg-indigo-600/20 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* İçerik Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Projeler ({projects.filter(p => p.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('blogs')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'blogs'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Bloglar ({blogs.filter(b => b.status === 'active').length})
          </button>

          {isOwnProfile && (
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setShowAddProject(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" /> Proje Ekle
              </button>
              <button
                onClick={() => { setEditingBlog(null); setShowBlogEditor(true); }}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" /> Blog Yaz
              </button>
            </div>
          )}
        </div>

        {/* İçerik Listesi */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'projects' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.filter(p => p.status === 'active').length === 0 ? (
                  <div className="col-span-2 text-center py-16 text-white/30">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Henüz proje yok</p>
                    {isOwnProfile && (
                      <button onClick={() => setShowAddProject(true)} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-indigo-500 transition-colors">
                        İlk projeyi ekle
                      </button>
                    )}
                  </div>
                ) : (
                  projects.filter(p => p.status === 'active').map((project) => (
                    <div key={project.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group">
                      <div className="relative h-40 overflow-hidden">
                        <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="bg-indigo-600/80 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {project.category}
                          </span>
                          <span className="bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {project.difficulty}
                          </span>
                        </div>
                        {isOwnProfile && (
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-1 line-clamp-1">{project.title}</h3>
                        <p className="text-white/50 text-sm line-clamp-2 mb-3">{project.description}</p>
                        <div className="flex items-center justify-between text-white/40 text-xs">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {project.likes}</span>
                          <span>⏱ {project.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'blogs' && (
              <div className="space-y-4">
                {blogs.filter(b => b.status === 'active').length === 0 ? (
                  <div className="text-center py-16 text-white/30">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Henüz blog yazısı yok</p>
                    {isOwnProfile && (
                      <button onClick={() => { setEditingBlog(null); setShowBlogEditor(true); }} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-purple-500 transition-colors">
                        İlk blogu yaz
                      </button>
                    )}
                  </div>
                ) : (
                  blogs.filter(b => b.status === 'active').map((blog) => (
                    <div key={blog.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group">
                      <div className="flex gap-4 p-4">
                        {blog.coverImage && (
                          <img src={blog.coverImage} alt={blog.title} className="w-24 h-20 object-cover rounded-xl flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold mb-1 line-clamp-1">{blog.title}</h3>
                          <p className="text-white/50 text-sm line-clamp-2 mb-2">{blog.excerpt}</p>
                          <div className="flex items-center gap-3 text-white/40 text-xs">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {blog.likes}</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views}</span>
                            <span>{blog.createdAt && typeof (blog.createdAt as any).toDate === 'function' ? (blog.createdAt as any).toDate().toLocaleDateString('tr-TR') : ''}</span>
                          </div>
                        </div>
                        {isOwnProfile && (
                          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setEditingBlog(blog); setShowBlogEditor(true); }}
                              className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 p-1.5 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(blog.id)}
                              className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-1.5 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modaller */}
      {showAddProject && (
        <FirebaseAddProjectModal
          onClose={() => setShowAddProject(false)}
          onSuccess={loadData}
        />
      )}

      {showBlogEditor && (
        <FirebaseBlogEditor
          existingBlog={editingBlog}
          onClose={() => { setShowBlogEditor(false); setEditingBlog(null); }}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
