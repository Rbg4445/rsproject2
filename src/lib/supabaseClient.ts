import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const SUPABASE_BUCKET = (import.meta.env.VITE_SUPABASE_BUCKET as string | undefined) ?? 'files';

let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn('[Supabase] VITE_SUPABASE_URL veya VITE_SUPABASE_ANON_KEY tanimli degil. Supabase devre disi.');
}

export function getSupabaseClient(): SupabaseClient | null {
  return supabase;
}

export function getSupabaseBucket() {
  return SUPABASE_BUCKET;
}

export async function uploadFileToSupabase(path: string, file: File): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase yapılandırılmamış.');
  }

  const filePath = `${path}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('[Supabase] Upload hatası:', error.message);
    throw new Error('Dosya yüklenemedi. Lütfen daha sonra tekrar deneyin.');
  }

  const { data: publicUrlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error('Yükleme başarılı ama public URL alınamadı.');
  }

  return publicUrlData.publicUrl;
}
