import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError,
} from 'firebase/auth';
import { auth, googleProvider } from './config';
import { createUserProfile, getUserProfile } from './firestoreService';

// Hata mesajlarını Türkçeleştir
export function getAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Bu email adresi zaten kayıtlı.';
    case 'auth/invalid-email':
      return 'Geçersiz email adresi.';
    case 'auth/weak-password':
      return 'Şifre en az 6 karakter olmalıdır.';
    case 'auth/user-not-found':
      return 'Bu email ile kayıtlı kullanıcı bulunamadı.';
    case 'auth/wrong-password':
      return 'Hatalı şifre.';
    case 'auth/invalid-credential':
      return 'Email veya şifre hatalı.';
    case 'auth/too-many-requests':
      return 'Çok fazla başarısız deneme. Lütfen bekleyin.';
    case 'auth/network-request-failed':
      return 'Ağ bağlantısı hatası. İnternetinizi kontrol edin.';
    case 'auth/popup-closed-by-user':
      return 'Google girişi iptal edildi.';
    case 'auth/cancelled-popup-request':
      return 'Giriş işlemi iptal edildi.';
    case 'auth/operation-not-allowed':
      return 'Bu giriş yöntemi henüz etkin değil.';
    default:
      return `Bir hata oluştu: ${error.message}`;
  }
}

// Email & şifre ile kayıt
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
  username: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Firebase profile güncelle
    await updateProfile(firebaseUser, { displayName });

    // Email doğrulama gönder
    await sendEmailVerification(firebaseUser);

    // Firestore'a kullanıcı profili kaydet
    await createUserProfile(firebaseUser.uid, {
      email,
      displayName,
      username,
      role: 'user',
      status: 'active',
    });

    return { success: true };
  } catch (err) {
    const error = err as AuthError;
    return { success: false, error: getAuthErrorMessage(error) };
  }
}

// Email & şifre ile giriş
export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (err) {
    const error = err as AuthError;
    return { success: false, error: getAuthErrorMessage(error) };
  }
}

// Google ile giriş
export async function loginWithGoogle(): Promise<{ success: boolean; error?: string; isNew?: boolean }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Kullanıcı daha önce kayıtlı mı kontrol et
    const existing = await getUserProfile(firebaseUser.uid);
    if (!existing) {
      // Yeni kullanıcı - Firestore'a kaydet
      const username = firebaseUser.email?.split('@')[0].replace(/[^a-z0-9_-]/gi, '_').toLowerCase() || `user_${Date.now()}`;
      await createUserProfile(firebaseUser.uid, {
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Google Kullanıcısı',
        username,
        avatar: firebaseUser.photoURL || '',
        role: 'user',
        status: 'active',
      });
      return { success: true, isNew: true };
    }

    return { success: true, isNew: false };
  } catch (err) {
    const error = err as AuthError;
    return { success: false, error: getAuthErrorMessage(error) };
  }
}

// Çıkış
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Auth state dinleyici
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
