import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as db from './db';
import { checkRateLimit, recordFailedAttempt, clearRateLimit, validateEmail, sanitizeUsername, validatePasswordStrength } from '../utils/security';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isModerator: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string; remainingSeconds?: number };
  register: (data: { username: string; email: string; password: string; displayName: string }) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    db.seedDemoData();
    const session = db.validateSession();
    if (session) {
      setUser(session);
      db.setCurrentUser(session);
    }
  }, []);

  const login = (email: string, password: string): { success: boolean; error?: string; remainingSeconds?: number } => {
    // Rate limiting kontrolü
    const rateCheck = checkRateLimit(`login_${email}`);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Çok fazla başarısız deneme. ${rateCheck.remainingSeconds} saniye bekleyin.`,
        remainingSeconds: rateCheck.remainingSeconds,
      };
    }

    // Email doğrulama
    if (!validateEmail(email)) {
      return { success: false, error: 'Geçerli bir email adresi girin.' };
    }

    const result = db.loginUser(email, password);
    if (result.success && result.user) {
      clearRateLimit(`login_${email}`);
      setUser(result.user);
      db.setCurrentUser(result.user);
    } else {
      recordFailedAttempt(`login_${email}`);
      const newRateCheck = checkRateLimit(`login_${email}`);
      if (!newRateCheck.allowed) {
        return {
          success: false,
          error: `Hesap geçici olarak kilitlendi. ${newRateCheck.remainingSeconds} saniye bekleyin.`,
          remainingSeconds: newRateCheck.remainingSeconds,
        };
      }
      const attemptsLeft = newRateCheck.attemptsLeft;
      return {
        success: false,
        error: attemptsLeft && attemptsLeft <= 3
          ? `Email veya şifre hatalı. ${attemptsLeft} deneme hakkınız kaldı.`
          : result.error || 'Email veya şifre hatalı.',
      };
    }
    return { success: result.success, error: result.error };
  };

  const register = (data: { username: string; email: string; password: string; displayName: string }) => {
    // Rate limiting
    const rateCheck = checkRateLimit(`register_${data.email}`);
    if (!rateCheck.allowed) {
      return { success: false, error: `Kayıt denemesi engellendi. ${rateCheck.remainingSeconds} saniye bekleyin.` };
    }

    // Email doğrulama
    if (!validateEmail(data.email)) {
      return { success: false, error: 'Geçerli bir email adresi girin.' };
    }

    // Username doğrulama
    const sanitized = sanitizeUsername(data.username);
    if (sanitized !== data.username.toLowerCase()) {
      return { success: false, error: 'Kullanıcı adı sadece harf, rakam, alt çizgi ve tire içerebilir.' };
    }
    if (data.username.length < 3 || data.username.length > 20) {
      return { success: false, error: 'Kullanıcı adı 3-20 karakter arasında olmalıdır.' };
    }

    // Şifre güç kontrolü
    const strength = validatePasswordStrength(data.password);
    if (strength.score < 2) {
      return { success: false, error: `Şifre çok zayıf. ${strength.suggestions[0] || 'Daha güçlü bir şifre seçin.'}` };
    }

    // Display name doğrulama
    if (!data.displayName || data.displayName.trim().length < 2) {
      return { success: false, error: 'Ad Soyad en az 2 karakter olmalıdır.' };
    }

    const result = db.registerUser(data);
    if (result.success && result.user) {
      clearRateLimit(`register_${data.email}`);
      setUser(result.user);
      db.setCurrentUser(result.user);
    } else {
      recordFailedAttempt(`register_${data.email}`);
    }
    return { success: result.success, error: result.error };
  };

  const logout = () => {
    if (user) db.logoutUser(user.id);
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = db.updateUser(user.id, updates);
    if (updated) {
      setUser(updated);
      db.setCurrentUser(updated);
    }
  };

  const refreshUser = () => {
    if (!user) return;
    const fresh = db.getUserById(user.id);
    if (fresh) {
      setUser(fresh);
      db.setCurrentUser(fresh);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, isModerator, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
