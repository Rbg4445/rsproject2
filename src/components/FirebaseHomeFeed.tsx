import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Share2, Image as ImageIcon, Send, Link as LinkIcon, BookOpen, ArrowUp, Zap, FileText, X, ExternalLink, Download, Video, Heart, Plus } from 'lucide-react';
import { 
  getProjects, getBlogs, getArticles, 
  toggleProjectLike, toggleBlogLike, toggleArticleLike, 
  getOnlineUserCount, getAllUsers,
  FirestoreProject, FirestoreBlog, FirestoreArticle 
} from '../firebase/firestoreService';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import CommentsSection from './CommentsSection';
import FirebaseAddProjectModal from './FirebaseAddProjectModal';
import FirebaseBlogEditor from './FirebaseBlogEditor';
import FirebaseArticleEditor from './FirebaseArticleEditor';

interface FeedItem {
  id: string;
  type: 'project' | 'blog' | 'article';
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  imageUrl?: string;
  tags: string[];
  likes: string[];
  commentsCount: number;
  originalData: FirestoreProject | FirestoreBlog | FirestoreArticle;
}

function timeAgo(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'az önce';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}d önce`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}s önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}g önce`;
    return `${Math.floor(diffInDays / 30)} ay önce`;
  } catch {
    return 'bilinmiyor';
  }
}

interface FirebaseHomeFeedProps {
  feedFilter?: 'all' | 'project' | 'blog' | 'article';
}

export default function FirebaseHomeFeed({ feedFilter = 'all' }: FirebaseHomeFeedProps) {
  const { userProfile } = useFirebaseAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Selection/Detail State
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  
  // Modal States
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [activeModal, setActiveModal] = useState<'project' | 'blog' | 'article' | null>(null);

  useEffect(() => {
    loadFeed();
    loadStats();
    const interval = setInterval(loadStats, 60000); // 1 dk bir güncelle
    return () => clearInterval(interval);
  }, [feedFilter]);

  async function loadStats() {
    try {
      const [count, users] = await Promise.all([
        getOnlineUserCount(),
        getAllUsers()
      ]);
      setOnlineCount(count);
      setTotalUsers(users.length);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadFeed() {
    setLoading(true);
    try {
      const [projectsList, blogsList, articlesList] = await Promise.all([
        feedFilter === 'all' || feedFilter === 'project' ? getProjects() : Promise.resolve<FirestoreProject[]>([]),
        feedFilter === 'all' || feedFilter === 'blog' ? getBlogs() : Promise.resolve<FirestoreBlog[]>([]),
        feedFilter === 'all' || feedFilter === 'article' ? getArticles() : Promise.resolve<FirestoreArticle[]>([])
      ]);

      const { getCommentsForRef } = await import('../firebase/firestoreService');

      const mappedProjects = await Promise.all(projectsList.map(async p => ({
        id: p.id,
        type: 'project',
        title: p.title,
        description: p.description,
        authorId: p.uid,
        authorName: p.displayName || 'Anonim',
        createdAt: p.createdAt || new Date().toISOString(),
        imageUrl: p.image,
        tags: p.tags || [],
        likes: p.likes || [],
        commentsCount: (await getCommentsForRef('project', p.id)).length,
        originalData: p
      })));

      const mappedBlogs = await Promise.all(blogsList.map(async b => ({
        id: b.id,
        type: 'blog',
        title: b.title,
        description: b.summary || b.content.substring(0, 200) + '...',
        authorId: b.uid,
        authorName: b.displayName || 'Anonim',
        createdAt: b.createdAt || new Date().toISOString(),
        imageUrl: b.coverImage,
        tags: b.tags || [],
        likes: b.likes || [],
        commentsCount: (await getCommentsForRef('blog', b.id)).length,
        originalData: b
      })));

      const mappedArticles = await Promise.all(articlesList.map(async a => ({
        id: a.id,
        type: 'article',
        title: a.title,
        description: a.summary || a.content.substring(0, 200) + '...',
        authorId: a.uid,
        authorName: a.displayName || 'Anonim',
        createdAt: a.createdAt || new Date().toISOString(),
        imageUrl: a.coverImage,
        tags: a.tags || [],
        likes: a.likes || [],
        commentsCount: (await getCommentsForRef('article', a.id)).length,
        originalData: a
      })));

      const combined = [...mappedProjects, ...mappedBlogs, ...mappedArticles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setItems(combined);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const handleLike = async (item: FeedItem) => {
    if (!userProfile) return;
    
    // Optimistic update
    const hasLiked = item.likes.includes(userProfile.uid);
    const newLikes = hasLiked 
      ? item.likes.filter(id => id !== userProfile.uid)
      : [...item.likes, userProfile.uid];

    setItems(prev => prev.map(i => i.id === item.id && i.type === item.type ? { ...i, likes: newLikes } : i));
    if (selectedItem?.id === item.id && selectedItem.type === item.type) {
        setSelectedItem(prev => prev ? { ...prev, likes: newLikes } : null);
    }

    if (item.type === 'project') {
      await toggleProjectLike(item.id, userProfile.uid);
    } else if (item.type === 'blog') {
      await toggleBlogLike(item.id, userProfile.uid);
    } else if (item.type === 'article') {
      await toggleArticleLike(item.id, userProfile.uid);
    }
  };

  return (
    <div className="w-full text-zinc-300">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-12 py-6 flex justify-center lg:justify-start xl:justify-center gap-6">
        
        {/* Ana Akış (Feed) */}
        <div className="flex-1 max-w-[740px] w-full min-w-0">
          
          {/* Post Creation Modal / Menu */}
          {userProfile && (
            <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-3 flex gap-3 mb-6 items-center shadow-lg shadow-black/20">
                <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden flex shrink-0 items-center justify-center font-bold text-white">
                    {userProfile.avatar 
                        ? <img src={userProfile.avatar} className="w-full h-full object-cover" /> 
                        : userProfile.displayName?.charAt(0).toUpperCase()
                    }
                </div>
                <button 
                  onClick={() => setShowTypeSelect(true)}
                  className="flex-1 bg-black/40 hover:bg-black/60 border border-white/10 rounded-md px-4 py-2.5 text-sm text-gray-400 text-left transition"
                >
                  Yeni Gönderi Oluştur
                </button>
                <div className="flex gap-1.5 hidden sm:flex">
                    <button onClick={() => setActiveModal('project')} className="p-2.5 hover:bg-white/5 rounded-md text-gray-400 transition" title="Proje Paylaş"><ImageIcon className="w-5 h-5" /></button>
                    <button onClick={() => setActiveModal('blog')} className="p-2.5 hover:bg-white/5 rounded-md text-gray-400 transition" title="Blog Yaz"><LinkIcon className="w-5 h-5" /></button>
                </div>
            </div>
          )}

          {/* Feed Filter Sort Header */}
          <div className="flex items-center gap-4 mb-4 pb-2 border-b border-zinc-800/60">
             <button onClick={() => window.location.hash = 'home'} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition ${feedFilter === 'all' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:bg-white/5'}`}>
               <Zap className={`w-4 h-4 ${feedFilter === 'all' ? 'text-cyan-400' : ''}`} /> Tümü
             </button>
             <button onClick={() => window.location.hash = 'explore'} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition ${feedFilter === 'project' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:bg-white/5'}`}>
               <Send className="w-4 h-4" /> Projeler
             </button>
             <button onClick={() => window.location.hash = 'blogs'} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition ${feedFilter === 'blog' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:bg-white/5'}`}>
               <BookOpen className="w-4 h-4" /> Bloglar
             </button>
             <button onClick={() => window.location.hash = 'wiki'} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition ${feedFilter === 'article' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:bg-white/5'}`}>
               <FileText className="w-4 h-4" /> Wiki
             </button>
          </div>

          {/* Posts List */}
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(n => <div key={n} className="bg-zinc-900 h-40 animate-pulse rounded-xl" />)}
              </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900 rounded-xl border border-zinc-800/60">
                    <Zap className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-500">Henüz paylaşmılmış içerik bulunamadı.</p>
                </div>
            ) : items.map((item) => (
              <div 
                key={item.id + item.type} 
                onClick={() => setSelectedItem(item)}
                className="bg-zinc-900 border border-zinc-800/60 hover:border-zinc-700/80 rounded-xl overflow-hidden transition group flex cursor-pointer shadow-sm hover:shadow-lg hover:shadow-cyan-500/5"
              >
                {/* Voting Container */}
                <div className="w-12 bg-zinc-950/30 flex flex-col items-center py-3 shrink-0 border-r border-zinc-800/60">
                   <button 
                      onClick={(e) => { e.stopPropagation(); handleLike(item); }}
                      className={`p-1 rounded hover:bg-white/10 transition ${item.likes.includes(userProfile?.uid || '') ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <span className={`text-xs font-bold py-1 ${item.likes.includes(userProfile?.uid || '') ? 'text-orange-500' : 'text-gray-200'}`}>
                      {item.likes.length}
                    </span>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded hover:bg-white/10 transition text-gray-400 hover:text-indigo-400"
                    >
                      <ArrowUp className="w-5 h-5 rotate-180" />
                    </button>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Post Header */}
                  <div className="px-4 pt-3 flex items-center gap-1.5 text-xs">
                    <div className="w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 shadow-inner">
                      {item.type === 'project' ? <Send className="w-3 h-3 text-[#38bdf8]" /> : 
                       item.type === 'blog' ? <BookOpen className="w-3 h-3 text-green-400" /> : 
                       <FileText className="w-3 h-3 text-yellow-400" />}
                    </div>
                    <span className="font-bold text-white hover:underline">
                      {item.type === 'project' ? 'r/Projeler' : item.type === 'blog' ? 'r/Bloglar' : 'r/Wiki'}
                    </span>
                    <span className="text-[#818384]">• u/{item.authorName} • {timeAgo(item.createdAt)}</span>
                  </div>

                  {/* Post Title & Content Preview */}
                  <div className="px-4 pt-1 pb-1">
                    <h3 className="text-lg font-medium text-zinc-300 mb-1 group-hover:text-white transition">{item.title}</h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">#{tag}</span>
                        ))}
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-3 mb-2">{item.description}</p>
                    
                    {item.imageUrl && (
                      <div className="rounded overflow-hidden mb-1 mt-2 border border-white/5 bg-black/40">
                         <img src={item.imageUrl} alt={item.title} className="w-full max-h-[512px] object-contain mx-auto" />
                      </div>
                    )}
                  </div>

                  {/* Footer Stats Row */}
                  <div className="px-3 py-2 flex items-center gap-1">
                    <div className="flex items-center gap-1.5 hover:bg-white/5 transition rounded px-2 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-300">
                      <MessageSquare className="w-4 h-4" />
                      {item.commentsCount} Yorum
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(window.location.href); alert('Baglanti kopyalandi!'); }} className="flex items-center gap-1.5 hover:bg-white/5 transition rounded px-2 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-300">
                      <Share2 className="w-4 h-4" /> Paylaş
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ Widget Alanı */}
        <div className="hidden lg:block w-[312px] shrink-0">
          <div className="sticky top-24 space-y-4">
             
             {/* Community Info Widget */}
             <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
                <div className="h-24 bg-cover bg-center px-4 flex flex-col justify-end pb-3 relative" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600)' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>
                    <span className="text-white text-sm font-black uppercase tracking-wider relative z-10 drop-shadow-md">Topluluk Bilgisi</span>
                </div>
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-3 -mt-8 relative z-10">
                        <div className="w-16 h-16 bg-zinc-950 rounded-xl border-4 border-zinc-900 overflow-hidden flex shrink-0 shadow-xl">
                            <img src="https://github.com/Rbg4445/rsproject2/blob/main/Proje%20akademi%20(1).png?raw=true" className="w-full h-full object-cover p-1 bg-black" />
                        </div>
                        <div className="mt-6">
                            <h3 className="font-bold text-white text-lg leading-tight">r/ProjeAkademi</h3>
                        </div>
                    </div>
                    <p className="text-sm text-zinc-400 mb-4">Geleceği kodlayanların platformuna hoş geldiniz. Projelerini sergile, topluluğun bir parçası ol.</p>
                    
                    <div className="grid grid-cols-2 gap-4 border-y border-zinc-800/60 py-4 mb-4">
                        <div>
                            <div className="text-white font-bold">{totalUsers > 0 ? totalUsers.toLocaleString() : '...'}</div>
                            <div className="text-[10px] text-zinc-500 uppercase font-bold">Üyeler</div>
                        </div>
                        <div>
                            <div className="text-white font-bold flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] ${onlineCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`}></div> {onlineCount}</div>
                            <div className="text-[10px] text-zinc-500 uppercase font-bold">Aktif Kullanıcı</div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <button onClick={() => setShowTypeSelect(true)} className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2.5 rounded-full transition shadow-lg shadow-cyan-500/20">
                            Gönderi Paylaş
                        </button>
                        <button onClick={() => window.location.hash = 'leaderboard'} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-full transition border border-zinc-700/50 flex items-center justify-center gap-2">
                            🏆 Liderlik Tablosu
                        </button>
                    </div>
                </div>
             </div>

          </div>
        </div>

      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6" onClick={() => setSelectedItem(null)}>
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />
            <div className="relative w-full max-w-4xl h-full md:h-auto md:max-h-[95vh] bg-zinc-950 md:rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header Navbar for Detail View */}
                <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleLike(selectedItem)} className={`p-1.5 rounded-full transition ${selectedItem.likes.includes(userProfile?.uid || '') ? 'text-cyan-500' : 'text-zinc-400 hover:bg-zinc-800'}`}>
                            <ArrowUp className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-bold text-white">{selectedItem.likes.length} Beğeni</span>
                    </div>
                    <div className="flex items-center gap-3">
                         <span className="text-xs text-zinc-500">Post by u/{selectedItem.authorName}</span>
                         <button onClick={() => setSelectedItem(null)} className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-zinc-400 flex items-center gap-1 transition">
                            <X className="w-5 h-5" /> Kapat
                         </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 mb-4 text-xs">
                            <div className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase font-bold tracking-wider">
                                {selectedItem.type}
                            </div>
                            <span className="text-zinc-500">{timeAgo(selectedItem.createdAt)}</span>
                        </div>
                        
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 leading-tight">{selectedItem.title}</h2>
                        
                        {selectedItem.imageUrl && (
                            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-8">
                                <img src={selectedItem.imageUrl} className="w-full max-h-[600px] object-contain mx-auto" alt={selectedItem.title} />
                            </div>
                        )}

                        <div className="prose prose-invert max-w-none text-zinc-300 text-base leading-relaxed mb-10">
                            {/* Proje detayları vs. */}
                            {selectedItem.type === 'project' && (
                                <div className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Zorluk</p>
                                            <p className="text-cyan-400 font-bold">{(selectedItem.originalData as FirestoreProject).difficulty}</p>
                                        </div>
                                        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Kategori</p>
                                            <p className="text-green-400 font-bold capitalize">{(selectedItem.originalData as FirestoreProject).category}</p>
                                        </div>
                                    </div>
                                    
                                    <p className="whitespace-pre-wrap">{(selectedItem.originalData as FirestoreProject).content || selectedItem.description}</p>
                                    
                                    <div className="flex flex-wrap gap-4 pt-4">
                                        {(selectedItem.originalData as FirestoreProject).github && (
                                            <a href={(selectedItem.originalData as FirestoreProject).github} target="_blank" className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/50 rounded-full text-sm transition font-medium text-white shadow-sm">
                                                <ImageIcon className="w-4 h-4" /> GitHub Kaynak
                                            </a>
                                        )}
                                        {(selectedItem.originalData as FirestoreProject).demo && (
                                            <a href={(selectedItem.originalData as FirestoreProject).demo} target="_blank" className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 border border-cyan-400/50 rounded-full text-sm transition font-bold text-white shadow-lg shadow-cyan-500/20">
                                                <ExternalLink className="w-4 h-4" /> Canlı Demo
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Blog/Wiki detayları */}
                            {(selectedItem.type === 'blog' || selectedItem.type === 'article') && (
                                <div className="whitespace-pre-wrap leading-loose">
                                    {(selectedItem.originalData as FirestoreBlog | FirestoreArticle).content}
                                </div>
                            )}
                        </div>

                        {/* Detay sayfası alt yorumlar */}
                        <div className="border-t border-white/10 pt-8">
                            <h4 className="text-lg font-bold text-white mb-6">Yorumlar</h4>
                            <CommentsSection refType={selectedItem.type} refId={selectedItem.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Creation Type Selector */}
      {showTypeSelect && !activeModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTypeSelect(false)} />
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
                <h3 className="text-xl font-bold text-white mb-1">Ne paylaşmak istiyorsun?</h3>
                <p className="text-zinc-400 text-sm mb-6">Topluluğa katkıda bulunmak için bir içerik tipi seç.</p>
                
                <div className="grid gap-3">
                    <button 
                        onClick={() => { setActiveModal('project'); setShowTypeSelect(false); }}
                        className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800/60 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition group"
                    >
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
                            <Send className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-white">Yeni Proje</p>
                            <p className="text-xs text-zinc-500">Geliştirdiğin bir yazılım veya tasarım.</p>
                        </div>
                    </button>

                    <button 
                         onClick={() => { setActiveModal('blog'); setShowTypeSelect(false); }}
                        className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800/60 hover:border-green-500/50 hover:bg-green-500/10 transition group"
                    >
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 group-hover:scale-110 transition">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-white">Blog Yazısı</p>
                            <p className="text-xs text-zinc-500">Düşüncelerini veya deneyimlerini aktar.</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => { setActiveModal('article'); setShowTypeSelect(false); }}
                        className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800/60 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition group"
                    >
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-400 group-hover:scale-110 transition">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-white">Wiki / Rehber</p>
                            <p className="text-xs text-zinc-500">Teknik dokümantasyon veya nasıl yapılır.</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Modals */}
      {activeModal === 'project' && <FirebaseAddProjectModal onClose={() => setActiveModal(null)} onSuccess={loadFeed} />}
      {activeModal === 'blog' && <FirebaseBlogEditor onClose={() => setActiveModal(null)} onSuccess={loadFeed} />}
      {activeModal === 'article' && <FirebaseArticleEditor onClose={() => setActiveModal(null)} onSuccess={loadFeed} />}

    </div>
  );
}
