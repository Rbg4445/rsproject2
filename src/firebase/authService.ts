// Firebase auth service - only called when Firebase is configured
import { auth, googleProvider } from './config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) { callback(null); return () => {}; }
  return onAuthStateChanged(auth, callback);
}

export async function loginWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase not configured');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase not configured');
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
  if (!auth || !googleProvider) throw new Error('Firebase not configured');
  return signInWithPopup(auth, googleProvider);
}

export async function logoutUser() {
  if (!auth) return;
  return signOut(auth);
}
