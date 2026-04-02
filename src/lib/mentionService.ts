import { addNotification, getUserByUsername } from '../firebase/firestoreService';

/**
 * Metin içindeki @kullaniciadlarını ve #hashtagleri ayıklar.
 */
export function parseMentionsAndHashtags(text: string) {
  const mentions = text.match(/@(\w+)/g)?.map(m => m.substring(1)) || [];
  const hashtags = text.match(/#(\w+)/g)?.map(h => h.substring(1)) || [];
  
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
  formatted = formatted.replace(/@(\w+)/g, '**@$1**');
  
  // #Hashtags -> *#hashtag* (Markdown formatında italik yapma)
  formatted = formatted.replace(/#(\w+)/g, '*#$1*');
  
  return formatted;
}
