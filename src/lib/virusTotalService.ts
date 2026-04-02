/**
 * VirusTotal API Service
 * Dosyaları yüklemeden önce virüs taramasından geçirir.
 * CORS için Vite proxy kullanır: /api/virustotal → https://www.virustotal.com/api/v3
 */

const VT_API_KEY = import.meta.env.VITE_VIRUSTOTAL_API_KEY as string | undefined;
const VT_BASE = '/api/virustotal'; // Vite proxy üzerinden

export interface VTScanResult {
  safe: boolean;
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  timeout: number;
  analysisId: string;
  fileName: string;
}

/** Dosyanın SHA-256 hash'ini tarayıcıda hesapla */
async function sha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Önce hash ile VT veritabanında tara (hızlı, API kotasını daha az tüketir) */
async function checkFileHash(hash: string): Promise<VTScanResult | null> {
  if (!VT_API_KEY) return null;
  try {
    const res = await fetch(`${VT_BASE}/files/${hash}`, {
      headers: { 'x-apikey': VT_API_KEY },
    });
    if (!res.ok) return null; // 404 = bilinmiyor, tarama gerekli

    const json = await res.json() as {
      data: { attributes: { last_analysis_stats: Record<string, number>; name?: string } };
    };
    const stats = json.data.attributes.last_analysis_stats;
    return {
      safe: (stats.malicious ?? 0) === 0 && (stats.suspicious ?? 0) <= 2,
      malicious:  stats.malicious  ?? 0,
      suspicious: stats.suspicious ?? 0,
      harmless:   stats.harmless   ?? 0,
      undetected: stats.undetected ?? 0,
      timeout:    stats.timeout    ?? 0,
      analysisId: hash,
      fileName:   json.data.attributes.name ?? 'bilinmiyor',
    };
  } catch {
    return null;
  }
}

/** Dosyayı VT'ye yükle ve tarama ID'sini al */
async function uploadFileForScan(file: File): Promise<string> {
  if (!VT_API_KEY) throw new Error('VirusTotal API key bulunamadı. Lütfen .env.local dosyasını kontrol edin.');

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${VT_BASE}/files`, {
    method: 'POST',
    headers: { 'x-apikey': VT_API_KEY },
    body: formData,
  });

  if (res.status === 404) {
    throw new Error('VirusTotal API ulaşılamıyor (404). Lütfen proxy ayarlarını (vercel.json veya vite.config.ts) kontrol edin.');
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`VT tarama başlatılamadı: ${res.status} - ${errText}`);
  }

  const json = await res.json() as { data: { id: string } };
  return json.data.id;
}

/** Tarama sonucunu polling ile bekle (max 60 sn) */
async function pollAnalysis(analysisId: string): Promise<VTScanResult> {
  if (!VT_API_KEY) throw new Error('VirusTotal API key tanımlı değil.');

  const MAX_POLLS = 20;
  const POLL_INTERVAL = 3000; // 3 sn

  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));

    const res = await fetch(`${VT_BASE}/analyses/${analysisId}`, {
      headers: { 'x-apikey': VT_API_KEY },
    });

    if (!res.ok) continue;

    const json = await res.json() as {
      data: {
        attributes: {
          status: string;
          stats: Record<string, number>;
          meta?: { file_info?: { name?: string } };
        };
      };
    };

    const { status, stats } = json.data.attributes;

    if (status === 'completed') {
      return {
        safe: (stats.malicious ?? 0) === 0 && (stats.suspicious ?? 0) <= 2,
        malicious:  stats.malicious  ?? 0,
        suspicious: stats.suspicious ?? 0,
        harmless:   stats.harmless   ?? 0,
        undetected: stats.undetected ?? 0,
        timeout:    stats.timeout    ?? 0,
        analysisId,
        fileName: json.data.attributes.meta?.file_info?.name ?? 'bilinmiyor',
      };
    }
  }

  throw new Error('Tarama zaman aşımına uğradı (60 saniye). Dosya yine de güvenli olabilir.');
}

/**
 * Ana fonksiyon — dosyayı tara ve sonucu döndür.
 * 1. Önce hash ile VT cache'ini kontrol eder (hızlı).
 * 2. Cache'de yoksa dosyayı yükler ve poll ile sonuç bekler.
 */
export async function scanFile(
  file: File,
  onStatus?: (msg: string) => void
): Promise<VTScanResult> {
  if (!VT_API_KEY) {
    // API key yoksa taramayı atla, güvenli say
    console.warn('[VT] API key yok, tarama atlandı.');
    return { safe: true, malicious: 0, suspicious: 0, harmless: 0, undetected: 0, timeout: 0, analysisId: '', fileName: file.name };
  }

  onStatus?.('Hash hesaplanıyor...');
  const hash = await sha256(file);

  onStatus?.('VT veritabanı kontrol ediliyor...');
  const cached = await checkFileHash(hash);
  if (cached) {
    onStatus?.(cached.safe ? '✅ Temiz (önbellekten)' : '❌ Tehdit tespit edildi!');
    return cached;
  }

  // VT'de yoksa dosyayı yükle
  onStatus?.('Dosya VirusTotal\'a gönderiliyor...');
  const analysisId = await uploadFileForScan(file);

  onStatus?.('Tarama yapılıyor... (bu 30–60 sn sürebilir)');
  const result = await pollAnalysis(analysisId);

  onStatus?.(result.safe ? '✅ Temiz' : '❌ Tehdit tespit edildi!');
  return result;
}
