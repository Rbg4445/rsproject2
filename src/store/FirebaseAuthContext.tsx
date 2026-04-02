import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isFirebaseConfigured } from '../firebase/config';
import { getClientIp } from '../utils/network';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FirestoreUser {
  uid: string;
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  role: 'user' | 'moderator' | 'admin';
  skills?: string[];
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  createdAt: string;
  lastLogin?: string;
  isBanned?: boolean;
  banReason?: string;
  projectCount?: number;
  blogCount?: number;
}

interface FirebaseAuthContextType {
  firebaseUser: null;
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

const FirebaseAuthContext = createContext(undefined as FirebaseAuthContextType | undefined);

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_USERS = 'pa_users';
const LS_SESSION = 'pa_session';
const ADMIN_EMAILS = ['admin@projeakademi.com'];
const DEFAULT_ADMIN_PASSWORD = 'Admin@2025!';

function ensureRole(user: FirestoreUser): FirestoreUser {
  if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return { ...user, role: 'admin' };
  }
  return user;
}

function getUsers(): FirestoreUser[] {
  try { return JSON.parse(localStorage.getItem(LS_USERS) || '[]'); } catch { return []; }
}
function saveUsers(users: FirestoreUser[]) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}
function hashPassword(pass: string): string {
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    hash = (hash << 5) - hash + pass.charCodeAt(i);
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16) + '_' + pass.length;
}

function seedAdmin() {
  const users = getUsers();
  if (!users.find(u => u.email === 'admin@projeakademi.com')) {
    users.push({
      uid: 'admin-001',
      username: 'admin',
      email: 'admin@projeakademi.com',
      displayName: 'Admin',
      role: 'admin',
      createdAt: new Date().toISOString(),
      bio: 'Site yöneticisi',
    });
    saveUsers(users);
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState(null as FirestoreUser | null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedAdmin();
    // Firebase varsa Firebase auth dene, yoksa localStorage
    if (isFirebaseConfigured) {
      initFirebase();
    } else {
      initLocal();
    }
  }, []);

  function initLocal() {
    try {
      const sessionData = localStorage.getItem(LS_SESSION);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.expires > Date.now()) {
          const users = getUsers();
          const user = users.find(u => u.uid === session.uid);
          if (user && !user.isBanned) setUserProfile(user);
        } else {
          localStorage.removeItem(LS_SESSION);
        }
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function initFirebase() {
    try {
      const { onAuthChange } = await import('../firebase/authService');
      const { getUserProfile } = await import('../firebase/firestoreService');
      onAuthChange(async (fbUser) => {
        if (fbUser) {
          try {
            const { logoutUser } = await import('../firebase/authService');
            const profile = await getUserProfile(fbUser.uid);
            if (profile?.isBanned) {
              await logoutUser();
              setUserProfile(null);
              setLoading(false);
              return;
            }
            if (profile) setUserProfile(ensureRole(profile as FirestoreUser));
          } catch { /* ignore */ }
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
    } catch {
      initLocal();
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; remainingSeconds?: number }> => {
    const ip = await getClientIp();
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    const { isIpBlocked, addAccessLog } = await import('../firebase/firestoreService');
    const blockedIp = await isIpBlocked(ip);

    if (blockedIp) {
      await addAccessLog({ action: 'LOGIN_FAIL', email, ip, userAgent, success: false, reason: `IP blocked: ${blockedIp.reason}` });
      return { success: false, error: `Bu IP adresi engellenmis: ${blockedIp.reason}` };
    }

    if (isFirebaseConfigured) {
      try {
        const { loginWithEmail } = await import('../firebase/authService');
        const { getUserProfile, updateLastLogin } = await import('../firebase/firestoreService');
        const result = await loginWithEmail(email, password);

        if (result.user) {
          const profile = await getUserProfile(result.user.uid);
          if (profile?.isBanned) {
            const { logoutUser } = await import('../firebase/authService');
            await logoutUser();
            await addAccessLog({
              uid: result.user.uid,
              email,
              action: 'LOGIN_FAIL',
              ip,
              userAgent,
              success: false,
              reason: `User banned: ${profile.banReason || 'Sebep belirtilmedi'}`,
            });
            return {
              success: false,
              error: `Banlandiniz. Bu hesaba erisiminiz engellendi. Sebep: ${profile.banReason || 'Kural ihlali'}`,
            };
          }

          if (profile) {
            await updateLastLogin(result.user.uid);
            setUserProfile(ensureRole(profile as FirestoreUser));
          }
          await addAccessLog({ uid: result.user.uid, email, action: 'LOGIN_SUCCESS', ip, userAgent, success: true });
          return { success: true };
        }

        await addAccessLog({ action: 'LOGIN_FAIL', email, ip, userAgent, success: false, reason: 'No user in auth response' });
        return { success: false, error: 'Giriş başarısız.' };
      } catch (e: unknown) {
        const msg = (e as Error).message || '';

        if (
          email.toLowerCase() === 'admin@projeakademi.com' &&
          password === DEFAULT_ADMIN_PASSWORD &&
          (msg.includes('user-not-found') || msg.includes('invalid-credential'))
        ) {
          try {
            const { registerWithEmail } = await import('../firebase/authService');
            const { createUserProfile } = await import('../firebase/firestoreService');
            const created = await registerWithEmail(email, password);
            if (created.user) {
              const adminProfile: FirestoreUser = {
                uid: created.user.uid,
                username: 'admin',
                email,
                displayName: 'Admin',
                role: 'admin',
                createdAt: new Date().toISOString(),
                bio: 'Site yoneticisi',
              };
              await createUserProfile(adminProfile);
              setUserProfile(adminProfile);
              await addAccessLog({ uid: created.user.uid, email, action: 'LOGIN_SUCCESS', ip, userAgent, success: true, reason: 'Auto-seeded admin' });
              return { success: true };
            }
          } catch {
            // fallback to error parser below
          }
        }

        await addAccessLog({ action: 'LOGIN_FAIL', email, ip, userAgent, success: false, reason: msg || 'Unknown error' });
        if (msg.includes('configuration-not-found')) {
          return {
            success: false,
            error:
              'Firebase Authentication bu proje için tam ayarlanmamış. Firebase Console > Authentication > Sign-in method bölümünden en azından "Email/Password" yöntemini etkinleştirmen gerekiyor.',
          };
        }
        if (msg.includes('user-not-found')) return { success: false, error: 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.' };
        if (msg.includes('invalid-credential') || msg.includes('wrong-password')) return { success: false, error: 'E-posta veya şifre yanlış.' };
        if (msg.includes('too-many-requests')) return { success: false, error: 'Çok fazla deneme. Lütfen bekleyin.' };
        return { success: false, error: 'Giriş başarısız: ' + msg };
      }
    }

    const users = getUsers();
    const user = users.find((u) => u.email === email);
    if (!user) {
      await addAccessLog({ action: 'LOGIN_FAIL', email, ip, userAgent, success: false, reason: 'Email not found' });
      return { success: false, error: 'Bu e-posta adresi kayıtlı değil.' };
    }

    if (user.isBanned) {
      await addAccessLog({ uid: user.uid, email, action: 'LOGIN_FAIL', ip, userAgent, success: false, reason: `User banned: ${user.banReason || ''}` });
      return { success: false, error: 'Hesabınız yasaklandı: ' + (user.banReason || '') };
    }

    const hashed = hashPassword(password);
    const storedHash = localStorage.getItem(`pa_pw_${user.uid}`);
    if (user.uid === 'admin-001') {
      if (password !== 'Admin@2025!') {
        await addAccessLog({ uid: user.uid, email, action: 'LOGIN_FAIL', ip, userAgent, success: false, reason: 'Wrong password' });
        return { success: false, error: 'Şifre hatalı.' };
      }
    } else if (storedHash && storedHash !== hashed) {
      await addAccessLog({ uid: user.uid, email, action: 'LOGIN_FAIL', ip, userAgent, success: false, reason: 'Wrong password' });
      return { success: false, error: 'Şifre hatalı.' };
    }

    user.lastLogin = new Date().toISOString();
    saveUsers(users);
    localStorage.setItem(LS_SESSION, JSON.stringify({ uid: user.uid, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
    setUserProfile(user);
    await addAccessLog({ uid: user.uid, email, action: 'LOGIN_SUCCESS', ip, userAgent, success: true });
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    const ip = await getClientIp();
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    const { isIpBlocked, addAccessLog } = await import('../firebase/firestoreService');
    const blockedIp = await isIpBlocked(ip);

    if (blockedIp) {
      await addAccessLog({ action: 'LOGIN_FAIL', ip, userAgent, success: false, reason: `IP blocked: ${blockedIp.reason}` });
      return { success: false, error: `Bu IP adresi engellenmis: ${blockedIp.reason}` };
    }

    if (isFirebaseConfigured) {
      try {
        const { loginWithGoogle: fbGoogle } = await import('../firebase/authService');
        const { getUserProfile, createUserProfile, updateLastLogin } = await import('../firebase/firestoreService');
        const result = await fbGoogle();

        if (result.user) {
          let profile = await getUserProfile(result.user.uid);
          if (!profile) {
            const newProfile: FirestoreUser = {
              uid: result.user.uid,
              username: result.user.email?.split('@')[0] || 'user',
              email: result.user.email || '',
              displayName: result.user.displayName || 'Kullanici',
              role: 'user',
              createdAt: new Date().toISOString(),
            };
            await createUserProfile(newProfile);
            profile = ensureRole(newProfile);
          }

          if (profile?.isBanned) {
            const { logoutUser } = await import('../firebase/authService');
            await logoutUser();
            await addAccessLog({
              uid: result.user.uid,
              email: result.user.email || undefined,
              action: 'LOGIN_FAIL',
              ip,
              userAgent,
              success: false,
              reason: `User banned: ${profile.banReason || 'Sebep belirtilmedi'}`,
            });
            return {
              success: false,
              error: `Banlandiniz. Bu hesaba erisiminiz engellendi. Sebep: ${profile.banReason || 'Kural ihlali'}`,
            };
          }

          await updateLastLogin(result.user.uid);
          await addAccessLog({
            uid: result.user.uid,
            email: result.user.email || undefined,
            action: 'LOGIN_SUCCESS',
            ip,
            userAgent,
            success: true,
          });
          setUserProfile(ensureRole(profile as FirestoreUser));
          return { success: true };
        }

        await addAccessLog({ action: 'LOGIN_FAIL', ip, userAgent, success: false, reason: 'Google response had no user' });
        return { success: false, error: 'Google girişi başarısız.' };
      } catch (e: unknown) {
        await addAccessLog({ action: 'LOGIN_FAIL', ip, userAgent, success: false, reason: (e as Error).message });
        return { success: false, error: (e as Error).message };
      }
    }

    return { success: false, error: 'Google girişi için Firebase gerekli.' };
  };

  const register = async (data: { username: string; email: string; password: string; displayName: string }): Promise<{ success: boolean; error?: string }> => {
    // ── Username format validation ──────────────────────────────────────────
    const usernameClean = data.username.toLowerCase().trim();
    if (!/^[a-z0-9_]{3,20}$/.test(usernameClean)) {
      return { success: false, error: 'Kullanıcı adı 3-20 karakter olmalı, sadece harf, rakam ve _ içerebilir.' };
    }

    if (isFirebaseConfigured) {
      try {
        const { registerWithEmail } = await import('../firebase/authService');
        const { createUserProfile, isUsernameTaken } = await import('../firebase/firestoreService');

        // Firebase modunda da username benzersizlik kontrolü
        const taken = await isUsernameTaken(usernameClean);
        if (taken) return { success: false, error: 'Bu kullanıcı adı zaten alınmış. Lütfen farklı bir ad seçin.' };

        const result = await registerWithEmail(data.email, data.password);
        if (result.user) {
          const newProfile: FirestoreUser = {
            uid: result.user.uid,
            username: usernameClean,
            email: data.email,
            displayName: data.displayName,
            role: ADMIN_EMAILS.includes(data.email.toLowerCase()) ? 'admin' : 'user',
            createdAt: new Date().toISOString(),
          };
          await createUserProfile(newProfile);
          setUserProfile(newProfile);
          return { success: true };
        }
        return { success: false, error: 'Kayıt başarısız.' };
      } catch (e: unknown) {
        const msg = (e as Error).message || '';
        if (msg.includes('email-already-in-use')) return { success: false, error: 'Bu e-posta zaten kullanımda.' };
        if (msg.includes('weak-password')) return { success: false, error: 'Şifre çok zayıf (en az 6 karakter).' };
        return { success: false, error: 'Kayıt başarısız: ' + msg };
      }
    }

    // localStorage register
    const users = getUsers();
    if (users.find(u => u.email === data.email)) return { success: false, error: 'Bu e-posta zaten kullanımda.' };
    if (users.find(u => u.username.toLowerCase() === usernameClean)) return { success: false, error: 'Bu kullanıcı adı zaten alınmış. Lütfen farklı bir ad seçin.' };

    const newUser: FirestoreUser = {
      uid: 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2),
      username: usernameClean,
      email: data.email,
      displayName: data.displayName,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    localStorage.setItem(`pa_pw_${newUser.uid}`, hashPassword(data.password));
    localStorage.setItem(LS_SESSION, JSON.stringify({ uid: newUser.uid, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
    setUserProfile(newUser);
    return { success: true };
  };


  const logout = async () => {
    const ip = await getClientIp();
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    const currentUid = userProfile?.uid;
    const currentEmail = userProfile?.email;

    if (isFirebaseConfigured) {
      try {
        const { logoutUser } = await import('../firebase/authService');
        await logoutUser();
      } catch { /* ignore */ }
    }

    try {
      const { addAccessLog } = await import('../firebase/firestoreService');
      await addAccessLog({
        uid: currentUid,
        email: currentEmail,
        action: 'LOGOUT',
        ip,
        userAgent,
        success: true,
      });
    } catch {
      // ignore
    }

    localStorage.removeItem(LS_SESSION);
    setUserProfile(null);
  };

  const updateProfile = async (updates: Partial<FirestoreUser>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...updates };
    if (isFirebaseConfigured) {
      try {
        const { updateUserProfile } = await import('../firebase/firestoreService');
        await updateUserProfile(userProfile.uid, updates);
      } catch { /* ignore */ }
    }
    const users = getUsers();
    const idx = users.findIndex(u => u.uid === userProfile.uid);
    if (idx !== -1) { users[idx] = updated; saveUsers(users); }
    setUserProfile(updated);
  };

  const refreshProfile = async () => {
    if (!userProfile) return;
    const users = getUsers();
    const user = users.find(u => u.uid === userProfile.uid);
    if (user) setUserProfile(user);
  };

  const isAdmin = userProfile?.role === 'admin';
  const isModerator = userProfile?.role === 'moderator' || isAdmin;

  return (
    <FirebaseAuthContext.Provider value={{
      firebaseUser: null,
      userProfile,
      isAdmin,
      isModerator,
      loading,
      isFirebaseMode: isFirebaseConfigured,
      login,
      loginWithGoogle,
      register,
      logout,
      updateProfile,
      refreshProfile,
    }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const ctx = useContext(FirebaseAuthContext);
  if (!ctx) throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  return ctx;
}
