import { useEffect, useState } from 'react';
import { BookOpen, FolderPlus, PenLine, Trash2, Download, FileText } from 'lucide-react';
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

  const isOwner = !!userProfile && userProfile.username === username;

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
              <div className="flex gap-2">
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

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
              <FolderPlus className="h-5 w-5 text-indigo-400" />
              Projeler ({projects.length})
            </h2>
            <div className="space-y-3">
              {projects.length === 0 && <p className="text-sm text-white/50">Henuz proje yok.</p>}
              {projects.map((project) => (
                <div key={project.id} className="rounded-xl border border-white/10 bg-gray-900/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{project.title}</h3>
                      <p className="mt-1 text-sm text-white/60">{project.description}</p>

                      {!!project.documents?.length && (
                        <div className="mt-3 space-y-1.5">
                          {project.documents.map((doc) => (
                            <a
                              key={doc.id}
                              href={doc.dataUrl}
                              download={doc.name}
                              className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300 hover:bg-indigo-500/20"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              {doc.name}
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    {isOwner && (
                      <button
                        onClick={async () => {
                          await deleteProject(project.id);
                          await loadProfileData();
                        }}
                        className="rounded-lg p-2 text-red-300 hover:bg-red-500/15"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
              <BookOpen className="h-5 w-5 text-purple-400" />
              Blog Yazilari ({blogs.length})
            </h2>
            <div className="space-y-3">
              {blogs.length === 0 && <p className="text-sm text-white/50">Henuz blog yok.</p>}
              {blogs.map((blog) => (
                <div key={blog.id} className="rounded-xl border border-white/10 bg-gray-900/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{blog.title}</h3>
                      <p className="mt-1 text-sm text-white/60">{blog.summary}</p>
                    </div>
                    {isOwner && (
                      <button
                        onClick={async () => {
                          await deleteBlog(blog.id);
                          await loadProfileData();
                        }}
                        className="rounded-lg p-2 text-red-300 hover:bg-red-500/15"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
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
    </div>
  );
}
