import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebase } from './config';
import type { UserProfile } from '../../types/auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const { db } = getFirebase();
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    role: data.role,
    ownerId: data.ownerId,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    createdBy: data.createdBy,
  };
}

// ---------------------------------------------------------------------------
// Sign-up
// ---------------------------------------------------------------------------

export async function signUpAdmin(
  email: string,
  password: string,
  displayName?: string
): Promise<UserProfile> {
  const { auth, db } = getFirebase();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;

  const profile: Omit<UserProfile, 'uid' | 'createdAt'> & { createdAt: unknown } = {
    email,
    displayName: displayName ?? '',
    role: 'admin',
    ownerId: uid,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', uid), profile);

  return {
    uid,
    email,
    displayName: displayName ?? '',
    role: 'admin',
    ownerId: uid,
    createdAt: new Date(),
  };
}

// ---------------------------------------------------------------------------
// Sign-in
// ---------------------------------------------------------------------------

export async function signIn(
  email: string,
  password: string
): Promise<UserProfile> {
  const { auth } = getFirebase();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await fetchUserProfile(credential.user.uid);
  if (!profile) {
    throw new Error('User profile not found. Contact your administrator.');
  }
  return profile;
}

// ---------------------------------------------------------------------------
// Sign-out
// ---------------------------------------------------------------------------

export async function signOut(): Promise<void> {
  const { auth } = getFirebase();
  await firebaseSignOut(auth);
}

// ---------------------------------------------------------------------------
// Auth state observer
// ---------------------------------------------------------------------------

export function onAuthChanged(
  callback: (profile: UserProfile | null) => void
): () => void {
  const { auth } = getFirebase();
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (!user) {
      callback(null);
      return;
    }
    const profile = await fetchUserProfile(user.uid);
    callback(profile);
  });
}
