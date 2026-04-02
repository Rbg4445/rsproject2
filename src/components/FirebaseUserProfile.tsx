import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Folder, Edit2, Trash2, Download, FileText, User, Shield, BarChart, Activity } from 'lucide-react';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import {
  type FirestoreBlog,
  type FirestoreProject,
  type FirestoreUser,
  deleteBlog,
  deleteProject,
  getUserBlogs,
  getUserByUsername,
  getUserProjects,
} from '../firebase/firestoreService';
import FirebaseAddProjectModal from './FirebaseAddProjectModal';
import FirebaseBlogEditor from './FirebaseBlogEditor';
import EditProfileModal from './EditProfileModal';
import AdminApplicationModal from './AdminApplicationModal';

interface Props { username: string; }

export default function FirebaseUserProfile({ username }: Props) {
  const { userProfile } = useFirebaseAuth();
  const [profile, setProfile] = useState(null as FirestoreUser | null);
  const [projects, setProjects] = useState([] as FirestoreProject[]);
  const [blogs, setBlogs] = useState([] as FirestoreBlog[]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAdminApply, setShowAdminApply] = useState(false);
  const [activeTab, setActiveTab] = useState('projects' as 'projects' | 'blogs' | 'analytics');

  const isOwner = !!userProfile && userProfile.username === username;
  const isRbgProfile = useMemo(() => {
    const uname = profile?.username?.toLowerCase() || username.toLowerCase();
    const display = profile?.displayName?.toLowerCase() || '';
    return uname === 'rbg' || display === 'rbg';
  }, [profile, username]);

  useEffect(() => { loadProfileData(); }, [username]);

  async function loadProfileData() {
    setLoading(true);
    const p = await getUserByUsername(username);
    setProfile(p);
    if (p) {
      const [userProjects, userBlogs] = await Promise.all([getUserProjects(p.uid), getUserBlogs(p.uid)]);
      setProjects(userProjects);
      setBlogs(userBlogs);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="min-h-screen px-4 pt-28 text-center text-white/60">Profil yukleniyor...</div>;
  }
  if (!profile) {
    return <div className="min-h-screen px-4 pt-28 text-center text-white/60">Kullanici bulunamadi.</div>;
  }

  const totalLikes = projects.reduce((a, p) => a + (p.likes?.length || 0), 0)
                   + blogs.reduce((a, b) => a + (b.likes?.length || 0), 0);
  const score = projects.length * 50 + blogs.length * 30 + totalLikes * 10;

  return (
    <div className="min-h-screen px-4 pb-16 pt-24">
      <div className="mx-auto max-w-5xl">
        {/* Profil Kartı */}
        <div className="rounded-2xl border border-white/10 bg-gray-900/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-black text-white">
                {profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white">{profile.displayName}</h1>
                  {profile.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-xs font-bold text-indigo-300">
                      <Shield className="h-3 w-3" /> Admin
                    </span>
                  )}
                  {profile.role === 'moderator' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-xs font-bold text-purple-300">
                      <Shield className="h-3 w-3" /> Moderatör
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/50">@{profile.username}</p>
                <p className="mt-1 text-sm text-white/70">{profile.bio || 'Kisa bir biyografi henuz eklenmedi.'}</p>
              </div>
            </div>

            {isOwner && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-gray-700 transition"
                >
                  <User className="h-4 w-4" /> Profili Düzenle
                </button>
                {/* Admin olmayan kullanıcılar için başvuru butonu */}
                {profile.role === 'user' && (
                  <button
                    onClick={() => setShowAdminApply(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/20 transition"
                  >
                    <Shield className="h-4 w-4" /> Admin Başvurusu
                  </button>
                )}
                {isRbgProfile && (
                  <button
                    onClick={() => { window.location.hash = '#rbg'; }}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition"
                  >
                    RBG Sayfami Yonet
                  </button>
                )}
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
                >
                  <Folder className="h-4 w-4" /> Proje Ekle
                </button>
                <button
                  onClick={() => setShowBlogModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 transition"
                >
                  <Edit2 className="h-4 w-4" /> Blog Yaz
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sekmeler */}
        <div className="flex items-center gap-2 mt-6 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'projects' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Folder className="w-4 h-4" /> Projeler ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('blogs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'blogs' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Bloglar ({blogs.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'analytics' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <BarChart className="w-4 h-4" /> Analizler
          </button>
        </div>

        {/* İçerik */}
        <div className="mt-6">
          {activeTab === 'projects' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {projects.length === 0 && <p className="text-sm text-white/50 col-span-2 text-center py-10">Henuz proje yok.</p>}
              {projects.map(project => (
                <div key={project.id} className="rounded-2xl border border-white/10 bg-gray-900/50 p-5 hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-white">{project.title}</h3>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${project.status === 'active' ? 'bg-green-500/20 text-green-400' : project.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                          {project.status === 'active' ? 'Yayında' : project.status === 'pending' ? 'Bekliyor' : 'Kaldırıldı'}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 line-clamp-2">{project.description}</p>
                      {/* Etiketler */}
                      {project.tags?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {project.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-semibold rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-indigo-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {!!project.documents?.length && (
                        <div className="mt-3 space-y-1.5">
                          {project.documents.map(doc => (
                            <a key={doc.id} href={doc.dataUrl} download={doc.name}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300 hover:bg-indigo-500/20 transition-colors w-full sm:w-auto">
                              <FileText className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[150px]">{doc.name}</span>
                              <Download className="h-3 w-3 ml-auto" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    {isOwner && (
                      <button onClick={async () => { if (window.confirm('Silmek istediğinize emin misiniz?')) { await deleteProject(project.id); await loadProfileData(); } }}
                        className="rounded-xl p-2 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition flex-shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'blogs' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {blogs.length === 0 && <p className="text-sm text-white/50 col-span-2 text-center py-10">Henuz blog yok.</p>}
              {blogs.map(blog => (
                <div key={blog.id} className="rounded-2xl border border-white/10 bg-gray-900/50 p-5 hover:border-purple-500/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-white">{blog.title}</h3>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${blog.status === 'active' ? 'bg-green-500/20 text-green-400' : blog.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                          {blog.status === 'active' ? 'Yayında' : blog.status === 'pending' ? 'Bekliyor' : 'Kaldırıldı'}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 line-clamp-2">{blog.summary}</p>
                      {blog.tags?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {blog.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-semibold rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-purple-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {isOwner && (
                      <button onClick={async () => { if (window.confirm('Silmek istediğinize emin misiniz?')) { await deleteBlog(blog.id); await loadProfileData(); } }}
                        className="rounded-xl p-2 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition flex-shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Toplam Proje" value={projects.length} color="indigo" />
                <StatCard label="Toplam Blog"   value={blogs.length}    color="purple" />
                <StatCard label="Alınan Beğeni" value={totalLikes}      color="pink" />
                <StatCard label="Profil Puanı"  value={score}           color="emerald" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-gray-800/40 p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-400" /> İçerik Dağılımı</h3>
                <div className="space-y-3">
                  <BarRow label="Aktif Projeler" value={projects.filter(p => p.status === 'active').length} total={projects.length} color="bg-indigo-500" />
                  <BarRow label="Aktif Bloglar"  value={blogs.filter(b => b.status === 'active').length}    total={blogs.length}    color="bg-purple-500" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showProjectModal && (
        <FirebaseAddProjectModal onClose={() => setShowProjectModal(false)} onSuccess={() => { void loadProfileData(); }} />
      )}
      {showBlogModal && (
        <FirebaseBlogEditor onClose={() => setShowBlogModal(false)} onSuccess={() => { void loadProfileData(); }} />
      )}
      {showEditProfile && profile && (
        <EditProfileModal user={profile} onClose={() => setShowEditProfile(false)} onUpdated={() => { void loadProfileData(); }} />
      )}
      {showAdminApply && profile && (
        <AdminApplicationModal user={profile} onClose={() => setShowAdminApply(false)} />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    indigo:  { bg: 'bg-indigo-500/10 border-indigo-500/20',  text: 'text-indigo-400'  },
    purple:  { bg: 'bg-purple-500/10 border-purple-500/20',  text: 'text-purple-400'  },
    pink:    { bg: 'bg-pink-500/10 border-pink-500/20',      text: 'text-pink-400'    },
    emerald: { bg: 'bg-emerald-500/10 border-emerald-500/20',text: 'text-emerald-400' },
  };
  const c = colors[color as keyof typeof colors] || colors.indigo;
  return (
    <div className={`rounded-2xl border p-5 text-center ${c.bg}`}>
      <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-black ${c.text}`}>{value}</p>
    </div>
  );
}

function BarRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-white/50 mb-1">
        <span>{label}</span>
        <span>{value} / {total}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-700/50 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }} />
      </div>
    </div>
  );
}
