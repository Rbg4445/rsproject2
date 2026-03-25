import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from './config';

export type UploadProgress = {
  progress: number;
  state: 'running' | 'paused' | 'success' | 'error';
};

// Dosya boyutu kontrolü (max 5MB)
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Sadece JPEG, PNG, GIF ve WebP formatları desteklenir.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Dosya boyutu 5MB\'dan büyük olamaz.' };
  }

  return { valid: true };
}

// Profil fotoğrafı yükle
export function uploadAvatar(
  uid: string,
  file: File,
  onProgress?: (p: UploadProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      reject(new Error(validation.error));
      return;
    }

    const ext = file.name.split('.').pop();
    const storageRef = ref(storage, `avatars/${uid}/avatar.${ext}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          progress,
          state: snapshot.state as 'running' | 'paused',
        });
      },
      (error) => {
        onProgress?.({ progress: 0, state: 'error' });
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        onProgress?.({ progress: 100, state: 'success' });
        resolve(url);
      }
    );
  });
}

// Proje kapak görseli yükle
export function uploadProjectImage(
  uid: string,
  file: File,
  onProgress?: (p: UploadProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      reject(new Error(validation.error));
      return;
    }

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const storageRef = ref(storage, `projects/${uid}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          progress,
          state: snapshot.state as 'running' | 'paused',
        });
      },
      (error) => {
        onProgress?.({ progress: 0, state: 'error' });
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        onProgress?.({ progress: 100, state: 'success' });
        resolve(url);
      }
    );
  });
}

// Blog kapak görseli yükle
export function uploadBlogCover(
  uid: string,
  file: File,
  onProgress?: (p: UploadProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      reject(new Error(validation.error));
      return;
    }

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const storageRef = ref(storage, `blogs/${uid}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          progress,
          state: snapshot.state as 'running' | 'paused',
        });
      },
      (error) => {
        onProgress?.({ progress: 0, state: 'error' });
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        onProgress?.({ progress: 100, state: 'success' });
        resolve(url);
      }
    );
  });
}

// Dosya sil (URL'den)
export async function deleteFileByUrl(url: string): Promise<void> {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch {
    // Dosya zaten silinmiş olabilir
    console.warn('Dosya silinemedi (zaten silinmiş olabilir)');
  }
}
