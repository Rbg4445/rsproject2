import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Share2, Image as ImageIcon, Send, Link as LinkIcon, BookOpen, ArrowUp, Zap, FileText, X, ExternalLink, Download, Video, Heart, Plus } from 'lucide-react';
import { 
  getProjects, getBlogs, getArticles, 
  toggleProjectLike, toggleBlogLike, toggleArticleLike, 
  getOnlineUserCount, 
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
    const count = await getOnlineUserCount();
    setOnlineCount(count);
  }

  async function loadFeed() {
    setLoading(true);
    try {
      const [projectsList, blogsList, articlesList] = await Promise.all([
        feedFilter === 'all' || feedFilter === 'project' ? getProjects() : Promise.resolve<FirestoreProject[]>([]),
        feedFilter === 'all' || feedFilter === 'blog' ? getBlogs() : Promise.resolve<FirestoreBlog[]>([]),
        feedFilter === 'all' || feedFilter === 'article' ? getArticles() : Promise.resolve<FirestoreArticle[]>([])
      ]);

      const mappedProjects: FeedItem[] = projectsList.map(p => ({
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
        commentsCount: 0,
        originalData: p
      }));

      const mappedBlogs: FeedItem[] = blogsList.map(b => ({
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
        commentsCount: 0,
        originalData: b
      }));

      const mappedArticles: FeedItem[] = articlesList.map(a => ({
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
        commentsCount: 0,
        originalData: a
      }));

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
    <div className="min-h-screen bg-[#0B1416] text-[#D7DADC]">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-12 py-6 flex justify-center lg:justify-start xl:justify-center gap-6">
        
        {/* Ana Akış (Feed) */}
        <div className="flex-1 max-w-[740px] w-full min-w-0">
          
          {/* Post Creation Modal / Menu */}
          {userProfile && (
            <div className="bg-[#1A282D] border border-white/5 rounded-md p-3 flex gap-3 mb-6 items-center shadow-sm">
                <div className="w-9 h-9 rounded-full bg-black border border-[#27383F] overflow-hidden flex shrink-0 items-center justify-center font-bold">
                    {userProfile.avatar 
                        ? <img src={userProfile.avatar} className="w-full h-full object-cover" /> 
                        : userProfile.displayName?.charAt(0).toUpperCase()
                    }
                </div>
                <button 
                  onClick={() => setShowTypeSelect(true)}
                  className="flex-1 bg-[#27383F] hover:bg-[#2b3d45] border border-transparent hover:border-gray-500 rounded px-4 py-2 text-sm text-gray-400 text-left transition"
                >
                  Yeni bir proje, blog veya wiki paylaş...
                </button>
                <div className="flex gap-2">
                    <button onClick={() => setActiveModal('project')} className="p-2 hover:bg-white/5 rounded text-gray-400 transition" title="Proje Paylaş"><ImageIcon className="w-5 h-5" /></button>
                    <button onClick={() => setActiveModal('blog')} className="p-2 hover:bg-white/5 rounded text-gray-400 transition" title="Blog Yaz"><BookOpen className="w-5 h-5" /></button>
                </div>
            </div>
          )}

          {/* Feed Filter Sort Header */}
          <div className="flex items-center gap-4 mb-4 pb-2 border-b border-white/5">
             <button className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition ${feedFilter === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
               <Zap className={`w-4 h-4 ${feedFilter === 'all' ? 'text-orange-400' : ''}`} /> Tümü
             </button>
             <button onClick={() => window.location.hash = 'explore'} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition ${feedFilter === 'project' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
               <Send className="w-4 h-4" /> Projeler
             </button>
             <button onClick={() => window.location.hash = 'blogs'} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition ${feedFilter === 'blog' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
               <BookOpen className="w-4 h-4" /> Bloglar
             </button>
             <button onClick={() => window.location.hash = 'wiki'} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition ${feedFilter === 'article' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
               <FileText className="w-4 h-4" /> Wiki
             </button>
          </div>

          {/* Posts List */}
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(n => <div key={n} className="bg-[#1A282D] h-40 animate-pulse rounded-md" />)}
              </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 bg-[#1A282D] rounded-md border border-white/5">
                    <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Henüz paylaşmılmış içerik bulunamadı.</p>
                </div>
            ) : items.map((item) => (
              <div 
                key={item.id + item.type} 
                onClick={() => setSelectedItem(item)}
                className="bg-[#1A282D] border border-white/5 hover:border-white/20 rounded-md overflow-hidden transition group flex cursor-pointer"
              >
                {/* Voting Container */}
                <div className="w-10 bg-[#1A282D]/40 flex flex-col items-center py-2 shrink-0 border-r border-[#27383F]">
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
                  <div className="px-3 pt-2 flex items-center gap-1.5 text-xs">
                    <div className="w-5 h-5 rounded-full bg-black border border-[#27383F] flex items-center justify-center shrink-0">
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
                  <div className="px-3 pt-1 pb-1">
                    <h3 className="text-lg font-medium text-[#D7DADC] mb-1 group-hover:text-white transition">{item.title}</h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#27383F] text-gray-300">#{tag}</span>
                        ))}
                    </div>
                    <p className="text-sm text-[#D7DADC]/80 line-clamp-3 mb-2">{item.description}</p>
                    
                    {item.imageUrl && (
                      <div className="rounded overflow-hidden mb-1 mt-2 border border-white/5 bg-black/40">
                         <img src={item.imageUrl} alt={item.title} className="w-full max-h-[512px] object-contain mx-auto" />
                      </div>
                    )}
                  </div>

                  {/* Footer Stats Row */}
                  <div className="px-2 py-1 flex items-center gap-1">
                    <div className="flex items-center gap-1.5 hover:bg-white/10 transition rounded px-2 py-1.5 text-xs font-bold text-[#818384]">
                      <MessageSquare className="w-4 h-4" />
                      {item.commentsCount} Yorum
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center gap-1.5 hover:bg-white/10 transition rounded px-2 py-1.5 text-xs font-bold text-[#818384]">
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
             <div className="bg-[#1A282D] border border-white/5 rounded-md overflow-hidden">
                <div className="h-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 flex items-center">
                    <span className="text-white text-sm font-bold uppercase tracking-wider">Topluluk Bilgisi</span>
                </div>
                <div className="p-3">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-black rounded-lg border border-[#27383F] overflow-hidden flex shrink-0">
                            <img src="https://github.com/Rbg4445/rsproject2/blob/main/Proje%20akademi%20(1).png?raw=true" className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-bold text-white">r/ProjeAkademi</h3>
                    </div>
                    <p className="text-sm text-[#D7DADC] mb-4">Geleceği kodlayanların platformuna hoş geldiniz. Projelerini sergile, topluluğun bir parçası ol.</p>
                    
                    <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4 mb-4">
                        <div>
                            <div className="text-white font-bold">1,250</div>
                            <div className="text-[10px] text-[#818384] uppercase font-bold">Üyeler</div>
                        </div>
                        <div>
                            <div className="text-white font-bold flex items-center gap-1.5"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> {onlineCount}</div>
                            <div className="text-[10px] text-[#818384] uppercase font-bold">Aktif Kullanıcı</div>
                        </div>
                    </div>
                    
                    <button onClick={() => setShowTypeSelect(true)} className="w-full bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-white font-bold py-2 rounded-full transition shadow-lg shadow-blue-500/20">
                        Gönderi Paylaş
                    </button>
                </div>
             </div>

             {/* Rules Widget */}
             <div className="bg-[#1A282D] border border-white/5 rounded-md p-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 px-1">Topluluk Kuralları</h4>
                <div className="space-y-3">
                    {[
                        "Nezaket ve saygı esastır.",
                        "Spam ve reklam yasaktır.",
                        "Kaynak belirtilmesi önerilir.",
                        "Yalnızca teknoloji ve gelişim odaklıdır."
                    ].map((rule, i) => (
                        <div key={i} className="text-sm text-gray-300 flex gap-2">
                            <span className="text-gray-500 font-mono">{i+1}.</span>
                            <span>{rule}</span>
                        </div>
                    ))}
                </div>
             </div>
             
             {/* Footer Links */}
             <div className="text-[11px] text-[#818384] px-1 space-y-2">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                   <a href="#" className="hover:underline">Gizlilik Politikası</a>
                   <a href="#" className="hover:underline">Kullanıcı Sözleşmesi</a>
                   <a href="#" className="hover:underline">Yardım</a>
                </div>
                <p>RBG ProjeAkademi © 2026. <br/>Geleceğin dünyasını inşa edenler için.</p>
             </div>
          </div>
        </div>

      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6" onClick={() => setSelectedItem(null)}>
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />
            <div className="relative w-full max-w-4xl h-full md:h-auto md:max-h-[95vh] bg-[#1A282D] md:rounded-md border border-white/10 overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header Navbar for Detail View */}
                <div className="bg-black/40 border-b border-white/5 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleLike(selectedItem)} className={`p-1.5 rounded-full transition ${selectedItem.likes.includes(userProfile?.uid || '') ? 'text-orange-500' : 'text-gray-400'}`}>
                            <ArrowUp className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-bold text-white">{selectedItem.likes.length} Beğeni</span>
                    </div>
                    <div className="flex items-center gap-3">
                         <span className="text-xs text-gray-400">Post by u/{selectedItem.authorName}</span>
                         <button onClick={() => setSelectedItem(null)} className="p-1 px-2 hover:bg-white/5 rounded text-gray-400 flex items-center gap-1">
                            <X className="w-5 h-5" /> Kapat
                         </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 mb-4 text-xs">
                            <div className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-bold">
                                {selectedItem.type}
                            </div>
                            <span className="text-[#818384]">{timeAgo(selectedItem.createdAt)}</span>
                        </div>
                        
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 leading-tight">{selectedItem.title}</h2>
                        
                        {selectedItem.imageUrl && (
                            <div className="w-full bg-black border border-white/5 rounded-xl overflow-hidden mb-8">
                                <img src={selectedItem.imageUrl} className="w-full max-h-[600px] object-contain mx-auto" alt={selectedItem.title} />
                            </div>
                        )}

                        <div className="prose prose-invert max-w-none text-[#D7DADC] text-base leading-relaxed mb-10">
                            {/* Proje detayları vs. */}
                            {selectedItem.type === 'project' && (
                                <div className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Zorluk</p>
                                            <p className="text-indigo-400 font-bold">{(selectedItem.originalData as FirestoreProject).difficulty}</p>
                                        </div>
                                        <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Kategori</p>
                                            <p className="text-green-400 font-bold capitalize">{(selectedItem.originalData as FirestoreProject).category}</p>
                                        </div>
                                    </div>
                                    
                                    <p className="whitespace-pre-wrap">{(selectedItem.originalData as FirestoreProject).content || selectedItem.description}</p>
                                    
                                    <div className="flex flex-wrap gap-4 pt-4">
                                        {(selectedItem.originalData as FirestoreProject).github && (
                                            <a href={(selectedItem.originalData as FirestoreProject).github} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 border border-white/10 rounded-full text-sm transition">
                                                <ImageIcon className="w-4 h-4" /> GitHub Kaynak
                                            </a>
                                        )}
                                        {(selectedItem.originalData as FirestoreProject).demo && (
                                            <a href={(selectedItem.originalData as FirestoreProject).demo} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-[#38bdf8] text-white font-bold rounded-full text-sm transition">
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
            <div className="relative bg-[#1A282D] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                <h3 className="text-xl font-bold text-white mb-1">Ne paylaşmak istiyorsun?</h3>
                <p className="text-gray-400 text-sm mb-6">Topluluğa katkıda bulunmak için bir içerik tipi seç.</p>
                
                <div className="grid gap-3">
                    <button 
                        onClick={() => { setActiveModal('project'); setShowTypeSelect(false); }}
                        className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 transition group"
                    >
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
                            <Send className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-white">Yeni Proje</p>
                            <p className="text-xs text-gray-500">Geliştirdiğin bir yazılım veya tasarım.</p>
                        </div>
                    </button>

                    <button 
                         onClick={() => { setActiveModal('blog'); setShowTypeSelect(false); }}
                        className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-green-500/50 hover:bg-green-500/10 transition group"
                    >
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 group-hover:scale-110 transition">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-white">Blog Yazısı</p>
                            <p className="text-xs text-gray-500">Düşüncelerini veya deneyimlerini aktar.</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => { setActiveModal('article'); setShowTypeSelect(false); }}
                        className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition group"
                    >
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-400 group-hover:scale-110 transition">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-white">Wiki / Rehber</p>
                            <p className="text-xs text-gray-500">Teknik dokümantasyon veya nasıl yapılır.</p>
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
