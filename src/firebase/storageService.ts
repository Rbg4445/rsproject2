// Storage service - no-op when Firebase is not configured
// Bu dosya, Firebase yapılandırılmadığında hata almamak için basit stub fonksiyonlar sağlar.

export async function uploadProjectImage(_file: File, _uid: string): Promise<string> {
  // Gerçek senaryoda Firebase Storage'a yüklenip public URL döner
  return '';
}

export async function uploadProfileAvatar(_file: File, _uid: string): Promise<string> {
  // Profil avatarı için stub
  return '';
}

export async function uploadBlogCover(_file: File, _uid: string): Promise<string> {
  // Blog kapak görseli için stub
  return '';
}

// Firebase kullanılan senaryoda progress callback ile çalışan bir avatar yükleme fonksiyonu da bekleniyor.
// Şimdilik, profil bileşeninde kullanılan imzaya uygun boş bir fonksiyon ekliyoruz.
export async function uploadAvatar(
  _uid: string,
  _file: File,
  _onProgress?: (info: { progress: number }) => void,
): Promise<string> {
  if (_onProgress) {
    _onProgress({ progress: 100 });
  }
  return '';
}

export async function deleteFile(_url: string): Promise<void> {
  // no-op
}
