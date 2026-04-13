import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️  Replace these values with your actual Firebase project config.
// Go to Firebase Console → Project Settings → Your Apps → Web App config.
const firebaseConfig = {
  apiKey: 'REDACTED_API_KEY',
  authDomain: 'REDACTED_AUTH_DOMAIN',
  projectId: 'REDACTED_PROJECT_ID',
  storageBucket: 'REDACTED_PROJECT_ID.firebasestorage.app',
  messagingSenderId: 'REDACTED_SENDER_ID',
  appId: '1:REDACTED_SENDER_ID:web:a085a3f0c3067db5950285',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth is initialized with default persistence.
// Session is also persisted locally via SQLite (see db.ts + authStore.ts).
export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;
