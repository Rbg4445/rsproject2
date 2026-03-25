import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, loginWithEmail, loginWithGoogle, logoutUser, registerWithEmail } from '../firebase/authService';
import { getUserProfile, updateUserProfile, updateLastLogin, addLog, FirestoreUser } from '../firebase/firestoreService';
import { checkRateLimit, recordFailedAttempt, clearRateLimit, validateEmail, validatePasswordStrength } from '../utils/security';

interface FirebaseAuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: FirestoreUser | null;
  isAdmin: boolean;
  isModerator: boolean;
  loading: boolean;
  isFirebaseMode: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; remainingSeconds?: number }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (data: { username: string; email: string; password: string; displayName: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<FirestoreUser>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseMode] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser.uid);
          if (profile) {
            setUserProfile(profile);
            await updateLastLogin(fbUser.uid);
          }
        } catch (err) {
          console.error('Profil yüklenemedi:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; remainingSeconds?: number }> => {
    // Rate limiting
    const rateCheck = checkRateLimit(`login_${email}`);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Çok fazla başarısız deneme. ${rateCheck.remainingSeconds} saniye bekleyin.`,
        remainingSeconds: rateCheck.remainingSeconds,
      };
    }

    if (!validateEmail(email)) {
      return { success: false, error: 'Geçerli bir email adresi girin.' };
    }

    const result = await loginWithEmail(email, password);

    if (result.success) {
      clearRateLimit(`login_${email}`);
      await addLog({ action: 'Giriş yapıldı', username: email, type: 'success' });
    } else {
      recordFailedAttempt(`login_${email}`);
      const newRateCheck = checkRateLimit(`login_${email}`);
      await addLog({ action: 'Başarısız giriş denemesi', username: email, type: 'error' });
      if (!newRateCheck.allowed) {
        return {
          success: false,
          error: `Hesap geçici olarak kilitlendi. ${newRateCheck.remainingSeconds} saniye bekleyin.`,
          remainingSeconds: newRateCheck.remainingSeconds,
        };
      }
    }

    return result;
  };

  const handleGoogleLogin = async (): Promise<{ success: boolean; error?: string }> => {
    const result = await loginWithGoogle();
    if (result.success) {
      await addLog({ action: 'Google ile giriş yapıldı', type: 'success' });
    }
    return result;
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    displayName: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!validateEmail(data.email)) {
      return { success: false, error: 'Geçerli bir email adresi girin.' };
    }

    const strength = validatePasswordStrength(data.password);
    if (strength.score < 2) {
      return { success: false, error: 'Şifre çok zayıf. Daha güçlü bir şifre seçin.' };
    }

    const result = await registerWithEmail(data.email, data.password, data.displayName, data.username);

    if (result.success) {
      await addLog({ action: 'Yeni kullanıcı kaydı', username: data.username, type: 'success' });
    }

    return result;
  };

  const logout = async (): Promise<void> => {
    if (userProfile) {
      await addLog({ action: 'Çıkış yapıldı', username: userProfile.username, type: 'info' });
    }
    await logoutUser();
    setFirebaseUser(null);
    setUserProfile(null);
  };

  const updateProfile = async (updates: Partial<FirestoreUser>): Promise<void> => {
    if (!firebaseUser) return;
    await updateUserProfile(firebaseUser.uid, updates);
    const fresh = await getUserProfile(firebaseUser.uid);
    if (fresh) setUserProfile(fresh);
  };

  const refreshProfile = async (): Promise<void> => {
    if (!firebaseUser) return;
    const fresh = await getUserProfile(firebaseUser.uid);
    if (fresh) setUserProfile(fresh);
  };

  const isAdmin = userProfile?.role === 'admin';
  const isModerator = userProfile?.role === 'moderator' || isAdmin;

  return (
    <FirebaseAuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        isAdmin,
        isModerator,
        loading,
        isFirebaseMode,
        login,
        loginWithGoogle: handleGoogleLogin,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const ctx = useContext(FirebaseAuthContext);
  if (!ctx) throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  return ctx;
}
