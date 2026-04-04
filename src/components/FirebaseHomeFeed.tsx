import { useState, useEffect } from 'react';
import { MessageSquare, Share2, Image as ImageIcon, Send, Link as LinkIcon, BookOpen, ArrowUp, Zap, FileText } from 'lucide-react';
import { getProjects, getBlogs, getArticles, toggleProjectLike, toggleBlogLike, toggleArticleLike } from '../firebase/firestoreService';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';

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
}

function timeAgo(dateString: string) {
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
}

interface FirebaseHomeFeedProps {
  feedFilter?: 'all' | 'project' | 'blog' | 'article';
}

export default function FirebaseHomeFeed({ feedFilter = 'all' }: FirebaseHomeFeedProps) {
  const { userProfile } = useFirebaseAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, [feedFilter]);

  async function loadFeed() {
    setLoading(true);
    try {
      const [projectsList, blogsList, articlesList] = await Promise.all([
        feedFilter === 'all' || feedFilter === 'project' ? getProjects() : Promise.resolve([]),
        feedFilter === 'all' || feedFilter === 'blog' ? getBlogs() : Promise.resolve([]),
        feedFilter === 'all' || feedFilter === 'article' ? getArticles() : Promise.resolve([])
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
        commentsCount: 0
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
        commentsCount: 0
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
        commentsCount: 0
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

    setItems(prev => prev.map(i => i.id === item.id ? { ...i, likes: newLikes } : i));

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
        
        {/* Sol Menü (Reddit Left Sidebar varsayımı - Artık App.tsx Layout'taki Sidebar yerine feedin yanında gösterilebilir ama app'in sol menüsü var zatent. İptal, sadece 2 kolon) */}
        
        {/* Ana Akış (Feed) */}
        <div className="flex-1 max-w-[700px] w-full min-w-0">
          {/* Create Post Widget */}
          <div className="bg-[#1A282D] border border-white/5 rounded-md p-3 flex gap-3 mb-6 items-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex shrink-0 items-center justify-center font-bold">
              {userProfile ? userProfile.displayName?.charAt(0).toUpperCase() : '?'}
            </div>
            <input 
              type="text" 
              placeholder="Yeni bir proje veya blog paylaş..." 
              className="flex-1 bg-[#27383F] hover:bg-[#2b3d45] border border-transparent hover:border-gray-500 rounded px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:bg-[#1A282D] focus:border-white transition cursor-text"
              readOnly
            />
            <button className="p-2 hover:bg-white/5 rounded text-gray-400 transition hover:bg-white/10">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded text-gray-400 transition hover:bg-white/10">
              <LinkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
             <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-bold">
               <Zap className="w-4 h-4 text-orange-400" /> En İyiler
             </button>
             <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/5 text-gray-400 text-sm font-bold transition">
               <Send className="w-4 h-4" /> Yeni
             </button>
          </div>

          {/* Posts */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-10 text-gray-500 animate-pulse">Akış yükleniyor...</div>
            ) : items.map((item) => (
              <div key={item.id + item.type} className="bg-[#1A282D] border border-white/5 hover:border-white/20 rounded-md overflow-hidden transition group flex hover:cursor-pointer">
                {/* Sol oy sistemi (Reddit klasik) */}
                <div className="w-10 bg-[#1A282D]/80 flex flex-col items-center py-2 shrink-0 border-r border-[#27383F]">
                   <button 
                      onClick={() => handleLike(item)}
                      className={`p-1 rounded hover:bg-white/10 transition ${item.likes.includes(userProfile?.uid || '') ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <span className={`text-xs font-bold py-1 ${item.likes.includes(userProfile?.uid || '') ? 'text-orange-500' : 'text-gray-200'}`}>
                      {item.likes.length}
                    </span>
                    <button className="p-1 rounded hover:bg-white/10 transition text-gray-400 hover:text-indigo-400">
                      <ArrowUp className="w-5 h-5 rotate-180" />
                    </button>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Post Header */}
                  <div className="px-2 pt-2 flex items-center gap-1.5 text-xs">
                    <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                      {item.type === 'project' ? <Send className="w-2.5 h-2.5 text-indigo-400" /> : 
                       item.type === 'blog' ? <BookOpen className="w-2.5 h-2.5 text-green-400" /> : 
                       <FileText className="w-2.5 h-2.5 text-[#38bdf8]" />}
                    </div>
                    <span className="font-bold text-white hover:underline cursor-pointer">
                      {item.type === 'project' ? 'r/Projeler' : item.type === 'blog' ? 'r/Bloglar' : 'r/Wiki'}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-[#818384]">Pasted by u/{item.authorName}</span>
                    <span className="text-[#818384]">{timeAgo(item.createdAt)}</span>
                  </div>

                  {/* Post Content */}
                  <div className="px-2 pt-1 pb-1">
                    <h3 className="text-lg font-medium text-[#D7DADC] mb-1">{item.title}</h3>
                    {item.tags.length > 0 && (
                      <div className="flex gap-1 mb-2">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-[#27383F] text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-[#D7DADC] line-clamp-4 mb-2">{item.description}</p>
                    
                    {item.imageUrl && (
                      <div className="rounded overflow-hidden mb-1 mt-2 mx-[-8px]">
                         <img src={item.imageUrl} alt={item.title} className="w-full max-h-[512px] object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Post Actions row */}
                  <div className="px-1 py-1 flex items-center gap-1">
                    <button className="flex items-center gap-1.5 hover:bg-white/10 transition rounded px-2 py-1.5 text-xs font-bold text-[#818384]">
                      <MessageSquare className="w-4 h-4" />
                      {item.commentsCount} Yorum
                    </button>

                    <button className="flex items-center gap-1.5 hover:bg-white/10 transition rounded px-2 py-1.5 text-xs font-bold text-[#818384]">
                      <Share2 className="w-4 h-4" />
                      Paylaş
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ Widget Alanı (Son Paylaşımlar - Reddit Sidebar) */}
        <div className="hidden lg:block w-[312px] shrink-0">
          <div className="sticky top-24 space-y-4">
             {/* Info Widget */}
             <div className="bg-[#1A282D] border border-white/5 rounded p-3">
                <div className="flex items-center mb-2 gap-2">
                   <img src="https://cdn-icons-png.flaticon.com/128/1828/1828884.png" className="w-8 h-8 opacity-80" />
                   <h3 className="font-bold text-white text-base">r/ProjeAkademi</h3>
                </div>
                <p className="text-sm text-[#D7DADC] mb-4">Her türlü proje fikrini sergileyebileceğin, ilerlemeni kaydedebileceğin ve ilham alabileceğin alan.</p>
                <div className="flex gap-4 border-t border-white/10 pt-3 mb-4">
                   <div>
                     <div className="font-bold text-white">12.5k</div>
                     <div className="text-xs text-[#818384]">Üye</div>
                   </div>
                   <div>
                     <div className="font-bold text-white flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> 142</div>
                     <div className="text-xs text-[#818384]">Aktif</div>
                   </div>
                </div>
                <button className="w-full bg-white text-black font-bold py-1.5 rounded-full hover:bg-gray-200 transition">
                  Gönderi Oluştur
                </button>
             </div>

             {/* Recent Posts Widget */}
             <div className="bg-[#1A282D] border border-white/5 rounded p-3">
                <div className="flex items-center justify-between mb-3">
                   <h3 className="text-sm font-bold text-gray-300">SON PAYLAŞIMLAR</h3>
                </div>
                <div className="space-y-3">
                   {items.slice(0, 4).map(i => (
                     <div key={`recent-${i.id}`} className="flex flex-col gap-1 cursor-pointer group pb-3 border-b border-[#27383F] last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 text-xs">
                           <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
                             <Send className="w-2.5 h-2.5 text-[#38bdf8]" />
                           </div>
                           <span className="text-gray-400">r/{i.type === 'project' ? 'Projeler' : i.type === 'blog' ? 'Bloglar' : 'Wiki'}</span>
                        </div>
                        <p className="text-sm font-medium text-white group-hover:text-blue-400 transition leading-snug">{i.title}</p>
                        <p className="text-xs text-[#818384]">{i.likes.length} upvote • {i.commentsCount} yorum</p>
                     </div>
                   ))}
                </div>
             </div>

             {/* Footer Links */}
             <div className="text-xs text-[#818384] px-1">
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
                   <a href="#" className="hover:underline">Kullanıcı Anlaşması</a>
                   <a href="#" className="hover:underline">Gizlilik Politikası</a>
                </div>
                <p>ProjeAkademi © 2026. Tüm hakları saklıdır.</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
