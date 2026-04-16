import {
  createUserWithEmailAndPassword,
  signOut,
  initializeAuth,
  inMemoryPersistence,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getFirebase } from './config';
import type { UserProfile } from '../../types/auth';

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const { db } = getFirebase();
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid,
    email: d.email,
    displayName: d.displayName,
    role: d.role,
    ownerId: d.ownerId,
    createdAt: d.createdAt?.toDate() ?? new Date(),
    createdBy: d.createdBy,
  };
}

export async function listStaffMembers(adminUid: string): Promise<UserProfile[]> {
  const { db } = getFirebase();
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'staff'),
    where('ownerId', '==', adminUid)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      ownerId: data.ownerId,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      createdBy: data.createdBy,
    };
  });
}

// ---------------------------------------------------------------------------
// Create Staff
// ---------------------------------------------------------------------------

export async function createStaffUser(
  adminUid: string,
  email: string,
  password: string,
  displayName?: string
): Promise<UserProfile> {
  const { db } = getFirebase();

  // Pull config from the already-initialised primary app.
  const { auth: primaryAuth } = getFirebase();
  const primaryConfig = primaryAuth.app.options;

  // Spin up a short-lived secondary app instance.
  const secondaryApp = initializeApp(primaryConfig, `staff-creation-${Date.now()}`);
  const secondaryAuth = initializeAuth(secondaryApp, { persistence: inMemoryPersistence });

  let staffUid: string;
  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    staffUid = credential.user.uid;
    await signOut(secondaryAuth);
  } finally {
    await deleteApp(secondaryApp);
  }

  const profile = {
    email,
    displayName: displayName ?? '',
    role: 'staff' as const,
    ownerId: adminUid,
    createdAt: serverTimestamp(),
    createdBy: adminUid,
  };

  await setDoc(doc(db, 'users', staffUid), profile);

  return {
    uid: staffUid,
    email,
    displayName: displayName ?? '',
    role: 'staff',
    ownerId: adminUid,
    createdAt: new Date(),
    createdBy: adminUid,
  };
}

// ---------------------------------------------------------------------------
// Delete Staff
// ---------------------------------------------------------------------------

export async function removeStaffProfile(staffUid: string): Promise<void> {
  const { db } = getFirebase();
  await deleteDoc(doc(db, 'users', staffUid));
}
