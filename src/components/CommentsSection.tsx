import { useEffect, useState } from 'react';
import { MessageSquare, Send, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useFirebaseAuth } from '../store/FirebaseAuthContext';
import {
  type Comment,
  addComment,
  getCommentsForRef,
} from '../firebase/firestoreService';
import { notifyMentionedUsers, formatMentions } from '../lib/mentionService';
import { checkMultipleTexts } from '../lib/moderationService';

interface CommentsSectionProps {
  refType: Comment['refType'];
  refId: string;
}

export default function CommentsSection({ refType, refId }: CommentsSectionProps) {
  const { userProfile, isAdmin } = useFirebaseAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refType, refId]);

  const loadComments = async () => {
    setLoading(true);
    const data = await getCommentsForRef(refType, refId, isAdmin);
    setComments(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !content.trim()) return;
    setSubmitting(true);
    try {
      // API Ninja Profanity Check
      const hasProfaneWords = await checkMultipleTexts([content.trim()]);
      if (hasProfaneWords) {
        alert('Yorumunuz uygunsuz / argolu kelimeler içerdiği sistem tarafindan filtrelendi.');
        setSubmitting(false);
        return;
      }

      // Metni etiketler için formatla (@ -> **@**, # -> *#*)
      const formattedContent = formatMentions(content.trim());

      await addComment({
        refType,
        refId,
        uid: userProfile.uid,
        username: userProfile.username,
        content: formattedContent,
      });

      // Etiketli kullanıcılara bildirim gönder
      void notifyMentionedUsers(content.trim(), userProfile.username, refType, refId);

      setContent('');
      await loadComments();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10 rounded-2xl border border-zinc-800/60 bg-zinc-900 p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <MessageSquare className="h-4 w-4 text-cyan-400" />
        Yorumlar
        <span className="ml-1 text-xs font-normal text-zinc-500">({comments.length})</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-zinc-500 text-center py-4">Henuz yorum yok. Ilk yorumu sen yaz.</p>
      ) : (
        <ul className="space-y-3 mb-4">
            {comments.map((c) => (
              <li
                key={c.id}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  c.status === 'pending'
                    ? 'border-yellow-500/40 bg-yellow-500/5 text-yellow-100'
                    : 'border-zinc-800/60 bg-zinc-950/50 text-zinc-300'
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-[10px] font-bold text-white shadow-inner">
                      {c.username.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-xs text-zinc-300">{c.username}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(c.createdAt).toLocaleString('tr-TR', {
                      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800">
                  <ReactMarkdown>{c.content}</ReactMarkdown>
                </div>
                
              </li>
            ))}
        </ul>
      )}

      {userProfile ? (
        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Yorumunuzu buraya yazın... (Markdown kodları desteklenmektedir, örneğin: **kalın** veya `kod`)"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
              />
              <div className="absolute top-3 right-3 text-zinc-600">
                <Terminal className="w-4 h-4" />
              </div>
            </div>

            {/* Emojis */}
            <div className="flex flex-wrap gap-2 mt-1">
              {['👍', '❤️', '🔥', '🚀', '😂', '👏', '🎉', '💡', '🤔', '👀'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setContent(prev => prev + emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-base transition-colors border border-zinc-800 hover:scale-110 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] text-white/35">
              Yorumlar otomatik sistem (Ninja API) tarafindan kontrol edilir, küfür/argo içerikler otomatik engellenir.
            </p>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              Gonder
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-2 text-[11px] text-white/45">Yorum yazmak icin giris yapmalisin.</p>
      )}
    </section>
  );
}
