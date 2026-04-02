const NINJA_API_KEY = import.meta.env.VITE_NINJA_API_KEY as string;

export interface ProfanityResponse {
  original: string;
  censored: string;
  has_profanity: boolean;
}

/**
 * Metin icerisinde küfür veya argo olup olmadığını kontrol eder.
 * API Ninjas Profanity Filter API kullanır.
 */
export async function checkProfanity(text: string): Promise<boolean> {
  if (!NINJA_API_KEY) {
    console.warn('[Moderation] API Key eksik, kontrol atlaniyor.');
    return false;
  }

  if (!text || text.trim().length === 0) return false;

  try {
    // Vite Dev ortamı için /api/ninja proxy'sini kullanıyoruz.
    // Prod (Vercel) ortamı için vercel.json rewrite kuralını kullanıyoruz.
    const url = `/api/ninja/profanityfilter?text=${encodeURIComponent(text)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': NINJA_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.error('[Moderation] API Key hatali veya yetkisiz.');
      }
      return false; // Hata durumunda akışı engellememek için false dönüyoruz ama logluyoruz.
    }

    const data: ProfanityResponse = await response.json();
    return data.has_profanity;
  } catch (error) {
    console.error('[Moderation Error]:', error);
    return false;
  }
}

/**
 * Birden fazla metni toplu olarak kontrol eder.
 * Herhangi birinde küfür varsa true döner.
 */
export async function checkMultipleTexts(texts: string[]): Promise<boolean> {
  const checks = texts.map(t => checkProfanity(t));
  const results = await Promise.all(checks);
  return results.some(hasProfanity => hasProfanity === true);
}
