import { addNotification, getUserByUsername } from '../firebase/firestoreService';

// Türkçe karakterler ve tire desteği için Unicode-uyumlu regex desenleri
const MENTION_REGEX = /@([\w\u00C0-\u024F-]+)/g;
const HASHTAG_REGEX = /#([\w\u00C0-\u024F-]+)/g;

/**
 * Metin içindeki @kullaniciadlarını ve #hashtagleri ayıklar.
 * Türkçe karakterleri (ş, ğ, ü, ö, ç, İ vb.) ve tireleri destekler.
 */
export function parseMentionsAndHashtags(text: string) {
  const mentions = text.match(MENTION_REGEX)?.map(m => m.substring(1)) || [];
  const hashtags = text.match(HASHTAG_REGEX)?.map(h => h.substring(1)) || [];
  
  return {
    mentions: Array.from(new Set(mentions)), // Benzersiz kullanıcı adları
    hashtags: Array.from(new Set(hashtags))  // Benzersiz hashtagler
  };
}

/**
 * Etiketlenen kullanıcılara bildirim gönderir.
 */
export async function notifyMentionedUsers(
  text: string, 
  authorUsername: string,
  refType: 'project' | 'blog' | 'article',
  refId: string
) {
  const { mentions } = parseMentionsAndHashtags(text);
  
  for (const username of mentions) {
    // Kendini etiketleme durumunu kontrol et
    if (username.toLowerCase() === authorUsername.toLowerCase()) continue;

    try {
      const user = await getUserByUsername(username);
      if (user) {
        await addNotification({
          uid: user.uid,
          type: 'comment', // Genel bir tip ama 'mention' olarak da ayrılabilir
          refType,
          refId,
          message: `@${authorUsername} sizi bir yorumda etiketledi.`,
        });
        console.log(`[Mention] Bildirim gönderildi: @${username}`);
      }
    } catch (error) {
      console.error(`[Mention Error] @${username} için bildirim gönderilemedi:`, error);
    }
  }
}

/**
 * Yorum içindeki etiketleri ve hashtagleri link veya stil için işaretler.
 * (Frontend render sırasında kullanılabilir)
 */
export function formatMentions(text: string): string {
  if (!text) return text;
  
  let formatted = text;
  
  // @Mentions -> **@username** (Markdown formatında kalın yapma)
  formatted = formatted.replace(MENTION_REGEX, '**@$1**');
  
  // #Hashtags -> *#hashtag* (Markdown formatında italik yapma)
  formatted = formatted.replace(HASHTAG_REGEX, '*#$1*');
  
  return formatted;
}
