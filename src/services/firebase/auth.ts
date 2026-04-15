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
import { auth, db } from './config';
import type { UserProfile } from '../../types/auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fetch a user profile document from users/{uid}. Returns null if missing. */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
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
// Sign-up — always creates an Admin account
// ---------------------------------------------------------------------------

/**
 * Register a new Admin.
 * Creates a Firebase Auth user then writes users/{uid} with:
 *   role: "admin", ownerId: uid (admin owns their own workspace)
 */
export async function signUpAdmin(
  email: string,
  password: string,
  displayName?: string
): Promise<UserProfile> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;

  const profile: Omit<UserProfile, 'uid' | 'createdAt'> & { createdAt: unknown } = {
    email,
    displayName: displayName ?? '',
    role: 'admin',
    ownerId: uid, // Admin IS the owner
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

/**
 * Sign in with email + password, then load and return the UserProfile.
 * Works for both Admins and Staff.
 */
export async function signIn(
  email: string,
  password: string
): Promise<UserProfile> {
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
  await firebaseSignOut(auth);
}

// ---------------------------------------------------------------------------
// Auth state observer
// ---------------------------------------------------------------------------

/**
 * Subscribe to Firebase auth state changes.
 * Loads the UserProfile on sign-in; passes null on sign-out.
 * Returns the unsubscribe function.
 */
export function onAuthChanged(
  callback: (profile: UserProfile | null) => void
): () => void {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (!user) {
      callback(null);
      return;
    }
    const profile = await fetchUserProfile(user.uid);
    callback(profile);
  });
}
