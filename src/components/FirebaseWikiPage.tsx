import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, Eye, Heart, Plus, ArrowLeft } from 'lucide-react';
import {
  FirestoreArticle,
  getArticles,
  incrementArticleViews,
  toggleArticleLike,
} from '../firebase/firestoreService';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import FirebaseArticleEditor from './FirebaseArticleEditor';
import CommentsSection from './CommentsSection';

export default function FirebaseWikiPage() {
  const { userProfile } = useFirebaseAuth();
  const [articles, setArticles] = useState<FirestoreArticle[]>([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FirestoreArticle | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    void loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    const data = await getArticles();
    setArticles(data);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let base = articles;

    if (activeTag) {
      base = base.filter((article) =>
        (article.tags || []).map((t) => t.toLowerCase()).includes(activeTag.toLowerCase())
      );
    }

    if (!q) return base;

    return base.filter((article) => {
      return (
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [articles, search, activeTag]);

  const openArticle = async (article: FirestoreArticle) => {
    setSelected(article);
    await incrementArticleViews(article.id);
    setArticles((prev) =>
      prev.map((item) =>
        item.id === article.id ? { ...item, views: (item.views || 0) + 1 } : item
      )
    );
  };

  const handleLike = async (articleId: string) => {
    if (!userProfile) return;
    await toggleArticleLike(articleId, userProfile.uid);
    setArticles((prev) =>
      prev.map((article) => {
        if (article.id !== articleId) return article;
        const likes = article.likes || [];
        return {
          ...article,
          likes: likes.includes(userProfile.uid)
            ? likes.filter((uid) => uid !== userProfile.uid)
            : [...likes, userProfile.uid],
        };
      })
    );
    if (selected?.id === articleId) {
      setSelected((prev) => {
        if (!prev) return prev;
        const likes = prev.likes || [];
        return {
          ...prev,
          likes: likes.includes(userProfile.uid)
            ? likes.filter((uid) => uid !== userProfile.uid)
            : [...likes, userProfile.uid],
        };
      });
    }
  };

  return (
    <div className="min-h-screen px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        {!selected ? (
          <>
            <div className="mb-10 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-300">
                <BookOpen className="h-4 w-4" />
                ProjeAkademi Wiki
              </div>
              <h1 className="mb-3 text-4xl font-extrabold text-white">
                Bilgiyi <span className="gradient-text">Kesfet</span>
              </h1>
              <p className="text-white/55 max-w-2xl mx-auto text-sm">
                Proje fikri, teknik detay veya geliştirme süreci hakkında oluşturduğun dökümanları burada bir araya getirebilirsin. Arama kutusunu kullanarak belirli bir teknoloji ya da proje başlığına gidebilir veya yeni bir viki yazısı oluşturarak projeni dokümante edebilirsin.
              </p>
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-[1.5fr_1fr] items-stretch">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Vikide ara: konu, kavram veya etiket yaz..."
                  className="w-full rounded-xl border border-white/10 bg-gray-800/60 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none"
                />
                <p className="mt-2 text-xs text-left text-white/40">
                  Ornek: "React hook", "Veri yapilari", "Algoritmalar" veya favori teknolojinin adi.
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-gray-900/60 p-3 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Viki kisa yollari</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSearch('React');
                      setActiveTag(null);
                    }}
                    className="rounded-full bg-gray-800 px-3 py-1 text-xs text-white/70 hover:bg-cyan-600/30 hover:text-cyan-200"
                  >
                    React
                  </button>
                  <button
                    onClick={() => {
                      setSearch('JavaScript');
                      setActiveTag(null);
                    }}
                    className="rounded-full bg-gray-800 px-3 py-1 text-xs text-white/70 hover:bg-cyan-600/30 hover:text-cyan-200"
                  >
                    JavaScript
                  </button>
                  <button
                    onClick={() => {
                      setSearch('Algoritma');
                      setActiveTag(null);
                    }}
                    className="rounded-full bg-gray-800 px-3 py-1 text-xs text-white/70 hover:bg-cyan-600/30 hover:text-cyan-200"
                  >
                    Algoritmalar
                  </button>
                  <button
                    onClick={() => {
                      setSearch('Veri yapilari');
                      setActiveTag(null);
                    }}
                    className="rounded-full bg-gray-800 px-3 py-1 text-xs text-white/70 hover:bg-cyan-600/30 hover:text-cyan-200"
                  >
                    Veri yapilari
                  </button>
                </div>

                {userProfile && (
                  <button
                    onClick={() => setShowEditor(true)}
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Yeni viki makalesi yaz
                  </button>
                )}
              </div>
            </div>

            {articles.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                  <span className="font-semibold uppercase tracking-wide text-white/60">Populer etiketler:</span>
                  {[...new Set(articles.flatMap((a) => a.tags || []))].slice(0, 6).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag((prev) => (prev === tag ? null : tag))}
                      className={`rounded-full border px-3 py-1 ${
                        activeTag === tag
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                          : 'border-white/10 bg-gray-900/60 text-white/70 hover:border-cyan-400/60 hover:text-cyan-200'
                      } text-[11px]`}
                    >
                      #{tag}
                    </button>
                  ))}
                  {activeTag && (
                    <button
                      onClick={() => setActiveTag(null)}
                      className="ml-1 text-[11px] text-cyan-300 underline underline-offset-4"
                    >
                      Etiket filtresini temizle
                    </button>
                  )}
                </div>
                <div className="text-xs text-white/40">
                  Toplam {articles.length} makale listeleniyor
                </div>
              </div>
            )}

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="h-56 animate-pulse rounded-2xl border border-white/5 bg-gray-800/50" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-gray-900/60 py-16 text-center">
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-white/25" />
                <p className="font-semibold text-white">Makale bulunamadi</p>
                <p className="mt-1 text-sm text-white/50">Ilk makaleyi olusturup wikiyi baslatabilirsin.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((article) => {
                  const liked = userProfile ? (article.likes || []).includes(userProfile.uid) : false;
                  return (
                    <button
                      key={article.id}
                      onClick={() => void openArticle(article)}
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-gray-900/70 text-left transition hover:border-cyan-500/35"
                    >
                      {article.coverImage && (
                        <div className="h-36 overflow-hidden">
                          <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="line-clamp-2 font-bold text-white group-hover:text-cyan-300">{article.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm text-white/55">{article.summary}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-300">#{tag}</span>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-white/45">
                          <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{article.views || 0}</span>
                          <span className={`inline-flex items-center gap-1 ${liked ? 'text-pink-300' : ''}`}><Heart className={`h-3.5 w-3.5 ${liked ? 'fill-pink-300' : ''}`} />{(article.likes || []).length}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <ArticleDetail
            article={selected}
            currentUid={userProfile?.uid}
            onBack={() => setSelected(null)}
            onLike={handleLike}
            onOpenByTitle={(title) => {
              const target = articles.find((item) => item.title.toLowerCase() === title.toLowerCase());
              if (target) {
                void openArticle(target);
              }
            }}
          />
        )}
      </div>

      {showEditor && (
        <FirebaseArticleEditor
          onClose={() => setShowEditor(false)}
          onSuccess={() => {
            void loadArticles();
          }}
        />
      )}
    </div>
  );
}

function ArticleDetail({
  article,
  currentUid,
  onBack,
  onLike,
  onOpenByTitle,
}: {
  article: FirestoreArticle;
  currentUid?: string;
  onBack: () => void;
  onLike: (id: string) => void;
  onOpenByTitle: (title: string) => void;
}) {
  const liked = currentUid ? (article.likes || []).includes(currentUid) : false;
  const linkedContent = article.content.replace(/\[\[(.*?)\]\]/g, (_, title: string) => {
    const safeTitle = title.replace(/"/g, '&quot;');
    return `<button data-wiki-link="${safeTitle}" class="text-cyan-300 underline underline-offset-2">${title}</button>`;
  });

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-gray-900/70 p-6">
      <button onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Tum makaleler
      </button>

      {article.coverImage && (
        <div className="mb-6 h-64 overflow-hidden rounded-2xl">
          <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover" />
        </div>
      )}

      <h2 className="text-3xl font-extrabold text-white">{article.title}</h2>
      <p className="mt-3 text-white/65">{article.summary}</p>

      <div className="mt-5 flex items-center gap-3 border-y border-white/10 py-4 text-sm text-white/50">
        <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" />{article.views || 0} goruntuleme</span>
        <button
          onClick={() => onLike(article.id)}
          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 ${liked ? 'bg-pink-500/20 text-pink-300' : 'bg-white/5 text-white/60'}`}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-pink-300' : ''}`} />
          {(article.likes || []).length}
        </button>
      </div>

      <article
        className="wiki-content mt-6 space-y-4 text-[15px] leading-7 text-white/75"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === 'BUTTON' && target.dataset.wikiLink) {
            onOpenByTitle(target.dataset.wikiLink);
          }
        }}
        dangerouslySetInnerHTML={{
          __html: linkedContent
            .replace(/^### (.*)$/gm, '<h3 class="mt-6 text-xl font-bold text-white">$1</h3>')
            .replace(/^## (.*)$/gm, '<h2 class="mt-8 text-2xl font-bold text-white">$1</h2>')
            .replace(/^# (.*)$/gm, '<h1 class="mt-8 text-3xl font-black text-white">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
            .replace(/^- (.*)$/gm, '<li class="ml-5 list-disc">$1</li>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br/>')
            .replace(/^/, '<p>')
            .concat('</p>'),
        }}
      />

      <div className="mt-10 border-t border-white/10 pt-6">
        <CommentsSection refType="article" refId={article.id} />
      </div>
    </div>
  );
}