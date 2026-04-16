import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

type Services = { auth: Auth; db: Firestore };
let _services: Services | null = null;

/**
 * Lazily initialise Firebase on first call and cache the result.
 *
 * This avoids calling initializeAuth at module-evaluation time.
 * Expo Router eagerly imports all route files during startup; if Firebase is
 * initialised at import time the Auth SDK may not have finished registering
 * its component, causing the "Component auth has not been registered yet"
 * crash. Deferring to the first function call ensures the entire module
 * graph — including firebase/auth's self-registration side-effects — has
 * been fully evaluated first.
 */
export function getFirebase(): Services {
  if (_services) return _services;

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  // initializeAuth is idempotent in Firebase SDK v10+:
  //   First call  → registers the auth component and returns it.
  //   Repeat call → detects the same config and returns the existing instance.
  // getAuth is the safe fallback for Expo Go fast-refresh where initializeAuth
  // may detect the instance is already initialized.
  let auth: Auth;
  try {
    auth = initializeAuth(app, { persistence: inMemoryPersistence });
  } catch {
    auth = getAuth(app);
  }

  _services = { auth, db: getFirestore(app) };
  return _services;
}

export default getFirebase;
