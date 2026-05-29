/**
 * Auth service — Supabase Auth (Email) + Firebase Auth (Google) + Firestore (Profiles)
 */

import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc,
  collection, query, where, getDocs, limit,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { supabase } from './supabase';

// ── Types ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  phonePrefix?: string;
  birthDate?: string;
  newsletter: boolean;
  onboardingComplete: boolean;
  provider: 'email' | 'google';
  createdAt: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  isNew?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────

export async function getUserById(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as User) : null;
}

// ── Public API ─────────────────────────────────────────────────────

export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error.message.includes('User already registered') || error.status === 400) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Registration failed: No user returned.' };
    }

    const user: User = {
      id: data.user.id,
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      newsletter: false,
      onboardingComplete: false,
      provider: 'email',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', data.user.id), user);
    return { success: true, user, isNew: true };
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Registration failed.' };
  }
}

export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'Incorrect email or password.' };
      }
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Login failed: User not found.' };
    }

    const user = await getUserById(data.user.id);
    if (!user) {
      // Create user record in Firestore if it doesn't exist (failsafe)
      const mockUser: User = {
        id: data.user.id,
        email: data.user.email ?? email.toLowerCase().trim(),
        firstName: '',
        lastName: '',
        newsletter: false,
        onboardingComplete: false,
        provider: 'email',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', data.user.id), mockUser);
      return { success: true, user: mockUser };
    }
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Login failed.' };
  }
}

const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle(): Promise<AuthResult> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const existing = await getUserById(cred.user.uid);

    if (existing) {
      return { success: true, user: existing };
    }

    const parts = (cred.user.displayName ?? '').split(' ');
    const user: User = {
      id: cred.user.uid,
      email: cred.user.email!,
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' ') ?? '',
      newsletter: false,
      onboardingComplete: false,
      provider: 'google',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', cred.user.uid), user);
    return { success: true, user, isNew: true };
  } catch (err: any) {
    console.error('[loginWithGoogle] error:', err.code, err.message);
    if (
      err.code === 'auth/popup-closed-by-user' ||
      err.code === 'auth/cancelled-popup-request'
    ) {
      return { success: false, error: 'Sign-in cancelled.' };
    }
    return { success: false, error: err.message ?? 'Google sign-in failed.' };
  }
}

export async function updateProfile(
  updates: Partial<Omit<User, 'id' | 'email' | 'provider' | 'createdAt'>>,
): Promise<User | null> {
  let uid = auth.currentUser?.uid;

  if (!uid) {
    const { data: { session } } = await supabase.auth.getSession();
    uid = session?.user?.id;
  }

  if (!uid) return null;

  const ref = doc(db, 'users', uid);
  await updateDoc(ref, updates as Record<string, unknown>);
  return getUserById(uid);
}

export async function logout(): Promise<void> {
  await signOut(auth);
  await supabase.auth.signOut();
}

export async function emailExists(email: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'users'),
      where('email', '==', email.toLowerCase().trim()),
      limit(1),
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch {
    return false;
  }
}
