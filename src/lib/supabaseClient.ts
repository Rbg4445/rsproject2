import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const SUPABASE_BUCKET = (import.meta.env.VITE_SUPABASE_BUCKET as string | undefined) ?? 'files';

let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/** Dosya adındaki boşlukları ve Türkçe karakterleri temizler */
function sanitizeFilename(name: string): string {
  const trMap: { [key: string]: string } = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
  };
  
  let cleanName = name.replace(/[çğışüöÇĞİŞÜÖ]/g, (match) => trMap[match] || match);
  // Boşlukları tire yap, özel karakterleri temizle (nokta ve tire hariç)
  cleanName = cleanName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
  return cleanName;
}

export function getSupabaseClient(): SupabaseClient | null {
  return supabase;
}

export function getSupabaseBucket() {
  return SUPABASE_BUCKET;
}

export async function uploadFileToSupabase(path: string, file: File): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase yapılandırılmamış veya URL/Key eksik.');
  }

  // Dosya adını temizleyerek yolu oluştur
  const safeName = sanitizeFilename(file.name);
  const filePath = `${path}/${Date.now()}-${safeName}`;

  console.log('[Supabase] Yükleme denemesi:', filePath);

  const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('[Supabase Error Detail]:', error);
    if (error.message.includes('row-level security')) {
      throw new Error('Supabase Storage Politika Hatası: Lütfen SQL Editor ile "anon" erişim iznini tanımlayın.');
    }
    throw new Error(`Yükleme hatası: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
