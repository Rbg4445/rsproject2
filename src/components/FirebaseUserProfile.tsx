import { useEffect, useMemo, useState } from 'react';
import { BookOpen, FolderPlus, PenLine, Trash2, Download, FileText, Gamepad2, UserCog, BarChart3, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface Props {
  username: string;
}

export default function FirebaseUserProfile({ username }: Props) {
  const { userProfile } = useFirebaseAuth();
  const [profile, setProfile] = useState<FirestoreUser | null>(null);
  const [projects, setProjects] = useState<FirestoreProject[]>([]);
  const [blogs, setBlogs] = useState<FirestoreBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'blogs' | 'analytics'>('projects');


  const isOwner = !!userProfile && userProfile.username === username;
  const isRbgProfile = useMemo(() => {
    const uname = profile?.username?.toLowerCase() || username.toLowerCase();
    const display = profile?.displayName?.toLowerCase() || '';
    return uname === 'rbg' || display === 'rbg';
  }, [profile, username]);

  useEffect(() => {
    loadProfileData();
  }, [username]);

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

  return (
    <div className="min-h-screen px-4 pb-16 pt-24">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-white/10 bg-gray-900/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white">
                {profile.displayName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <h1 className="text-xl font-black text-white">{profile.displayName}</h1>
                <p className="text-sm text-white/50">@{profile.username}</p>
                <p className="mt-1 text-sm text-white/70">{profile.bio || 'Kisa bir biyografi henuz eklenmedi.'}</p>
              </div>
            </div>

            {isOwner && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-gray-700"
                >
                  <UserCog className="h-4 w-4" />
                  Profili Düzenle
                </button>
                {isRbgProfile && (
                  <button
                    onClick={() => {
                      window.location.hash = '#rbg';
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    <Gamepad2 className="h-4 w-4" />
                    RBG Sayfami Yonet
                  </button>
                )}
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  <FolderPlus className="h-4 w-4" />
                  Proje Ekle
                </button>
                <button
                  onClick={() => setShowBlogModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  <PenLine className="h-4 w-4" />
                  Blog Yaz
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-6 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'projects' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <FolderPlus className="w-4 h-4" /> Projeler ({projects.length})
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
            <BarChart3 className="w-4 h-4" /> Analizler
          </button>
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {activeTab === 'projects' && (
              <motion.section 
                key="projects"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {projects.length === 0 && <p className="text-sm text-white/50 col-span-2 text-center py-10">Henuz proje yok.</p>}
                {projects.map((project, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={project.id} 
                    className="rounded-2xl border border-white/10 bg-gray-900/50 p-5 hover:border-indigo-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-white text-lg">{project.title}</h3>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${project.status === 'active' ? 'bg-green-500/20 text-green-400' : project.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                            {project.status === 'active' ? 'Yayında' : project.status === 'pending' ? 'Bekliyor' : 'Kaldırıldı'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-white/60 line-clamp-2">{project.description}</p>

                        {!!project.documents?.length && (
                          <div className="mt-4 space-y-2">
                            {project.documents.map((doc) => (
                              <a
                                key={doc.id}
                                href={doc.dataUrl}
                                download={doc.name}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300 hover:bg-indigo-500/20 transition-colors w-full sm:w-auto"
                              >
                                <FileText className="h-4 w-4" />
                                <span className="truncate max-w-[150px]">{doc.name}</span>
                                <Download className="h-3.5 w-3.5 ml-auto" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      {isOwner && (
                        <button
                          onClick={async () => {
                            if (window.confirm("Silmek istediğinize emin misiniz?")) {
                              await deleteProject(project.id);
                              await loadProfileData();
                            }
                          }}
                          className="rounded-xl p-2 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.section>
            )}

            {activeTab === 'blogs' && (
              <motion.section 
                key="blogs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {blogs.length === 0 && <p className="text-sm text-white/50 col-span-2 text-center py-10">Henuz blog yok.</p>}
                {blogs.map((blog, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={blog.id} 
                    className="rounded-2xl border border-white/10 bg-gray-900/50 p-5 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-white text-lg">{blog.title}</h3>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${blog.status === 'active' ? 'bg-green-500/20 text-green-400' : blog.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                            {blog.status === 'active' ? 'Yayında' : blog.status === 'pending' ? 'Bekliyor' : 'Kaldırıldı'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-white/60 line-clamp-2">{blog.summary}</p>
                      </div>
                      {isOwner && (
                        <button
                          onClick={async () => {
                            if (window.confirm("Silmek istediğinize emin misiniz?")) {
                              await deleteBlog(blog.id);
                              await loadProfileData();
                            }
                          }}
                          className="rounded-xl p-2 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.section>
            )}

            {activeTab === 'analytics' && (
              <motion.section 
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 text-center">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Toplam Proje</p>
                    <p className="text-3xl font-black text-indigo-400">{projects.length}</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 text-center">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Toplam Blog</p>
                    <p className="text-3xl font-black text-purple-400">{blogs.length}</p>
                  </div>
                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-5 text-center">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Alınan Beğeni</p>
                    <p className="text-3xl font-black text-pink-400">
                      {projects.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0) + blogs.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0)}
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Profil Puanı</p>
                    <p className="text-3xl font-black text-emerald-400">
                      {(projects.length * 50) + (blogs.length * 30) + ((projects.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0) + blogs.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0)) * 10)}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-800/40 border border-white/5 rounded-2xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-400" /> Detaylı Dağılım</h3>
                  <div className="space-y-4">
                    {/* Basit bir CSS "Bar" Grafiği */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                        <span>Aktif vs Bekleyen Projeler</span>
                        <span>{projects.filter(p=>p.status==='active').length} / {projects.filter(p=>p.status==='pending').length}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-700/50 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-400 h-full" style={{ width: `${projects.length > 0 ? (projects.filter(p=>p.status==='active').length / projects.length) * 100 : 0}%` }}></div>
                        <div className="bg-yellow-400 h-full" style={{ width: `${projects.length > 0 ? (projects.filter(p=>p.status==='pending').length / projects.length) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>

      {showProjectModal && (
        <FirebaseAddProjectModal
          onClose={() => setShowProjectModal(false)}
          onSuccess={() => {
            void loadProfileData();
          }}
        />
      )}

      {showBlogModal && (
        <FirebaseBlogEditor
          onClose={() => setShowBlogModal(false)}
          onSuccess={() => {
            void loadProfileData();
          }}
        />
      )}

      {showEditProfile && profile && (
        <EditProfileModal
          user={profile}
          onClose={() => setShowEditProfile(false)}
          onUpdated={() => {
            void loadProfileData();
          }}
        />
      )}
    </div>
  );
}
