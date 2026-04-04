/**
 * Cloudinary Storage Service
 * Tarayıcı üzerinden "Unsigned Upload" (İmzasız Yükleme) teknolojisi kullanarak Dosya/Medya yükler.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

/**
 * Dosyayı Cloudinary'e yükler ve public indirme linkini döndürür.
 * @param path Storage üzerindeki hedef yol (Cloudinary'de folder olarak ayarlanabilir, ancak Unsigned upload için opsiyoneldir)
 * @param file Yüklenecek dosya nesnesi
 * @returns Yüklenen dosyanın public URL'i (Cloudinary secure_url)
 */
export async function uploadFile(path: string, file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary ayarları eksik. Lütfen .env.local dosyasındaki VITE_CLOUDINARY_CLOUD_NAME ve VITE_CLOUDINARY_UPLOAD_PRESET ayarlarını düzeltin.');
  }

  console.log(`[Cloudinary] Yükleme denemesi başlatılıyor... Dosya boyutu: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  // Opsiyonel olarak dosyaları folder içinde saklamak için klasör ismini veriyoruz:
  // Not: Unsigned preset ayarlarında dinamik folder izni açık olmalıdır. Aksi halde bu parametre yoksayılır.
  formData.append('folder', path);

  try {
    // '/auto/' endpoint'i kullanıldığında Cloudinary dosyanın resim mi, video mu yoksa belge (raw) mi olduğunu anlar.
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Cloudinary Upload Error Response]:', data);
      throw new Error(data.error?.message || 'Yükleme başarısız oldu.');
    }

    console.log('[Cloudinary] Dosya başarıyla yüklendi:', data.secure_url);
    
    // Yüklenen dosyanın CDN destekli güvenli URL'sini döndürüyoruz
    return data.secure_url;
  } catch (error: any) {
    console.error('[Cloudinary Catch Error]:', error);
    throw new Error(`Cloudinary yükleme hatası: ${error.message || 'Bilinmeyen hata'}`);
  }
}

/** 
 * Frontend (Browser) ortamından doğrudan dosya silme güvenli olmadığı için
 * Cloudinary Unsigned Uploads silme işlemlerine (Destroy API) izin vermez.
 * Dosya, kullanıcı projeyi silse dahi Cloudinary panelinde saklanır.
 * Veya ileride bir aracı Backend (Node.js/Next.js) sunucusu ile API Secret kullanılarak silinebilir.
 */
export async function deleteFileFromStorage(url: string): Promise<void> {
  if (!url) return;
  
  // URL Cloudinary'ye mi ait kontrolü
  if (url.includes('cloudinary.com')) {
    console.warn(
      '[Cloudinary Storage] İPTAL:',
      'Dosya silme işlemi güvenlik gereği Frontend üzerinden yapılamaz.',
      'Dosya veritabanından silindi ancak Cloudinary üzerinde kalmaya devam edecek.',
      'URL:', url
    );
  } else {
    console.warn('[Storage Delete] URL beklenmedik bir formata sahip, silinmedi:', url);
  }
  
  // İşlem yapmıyoruz (No-op)
  return Promise.resolve();
}
