import {
  createUserWithEmailAndPassword,
  signOut,
  getAuth,
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
import { db } from './config';
import type { UserProfile } from '../../types/auth';

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
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

/**
 * List all staff members that belong to the given admin.
 * Queries users where role=="staff" AND ownerId==adminUid.
 */
export async function listStaffMembers(adminUid: string): Promise<UserProfile[]> {
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

/**
 * Create a Staff Firebase Auth user without signing out the current Admin.
 *
 * Strategy: initialise a temporary secondary Firebase app instance, call
 * createUserWithEmailAndPassword on it (which signs the NEW user into that
 * secondary app only), capture the UID, then immediately destroy the
 * secondary app.  The primary app auth state is never touched.
 *
 * After getting the staff UID the admin writes the users/{staffUid} Firestore
 * doc while still authenticated as admin — the security rule allows this
 * because the doc carries ownerId == request.auth.uid (the admin).
 *
 * @param adminUid   UID of the currently signed-in admin
 * @param email      New staff member's email
 * @param password   New staff member's initial password
 * @param displayName  Optional display name
 */
export async function createStaffUser(
  adminUid: string,
  email: string,
  password: string,
  displayName?: string
): Promise<UserProfile> {
  // Pull the firebase config from the primary app so we don't hard-code it.
  const primaryApp = (await import('./config')).default;
  const primaryConfig = primaryApp.options;

  // Spin up a short-lived secondary app instance.
  const secondaryApp = initializeApp(primaryConfig, `staff-creation-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  let staffUid: string;
  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );
    staffUid = credential.user.uid;
    // Sign out of the secondary instance immediately.
    await signOut(secondaryAuth);
  } finally {
    // Always destroy the temporary app to avoid resource leaks.
    await deleteApp(secondaryApp);
  }

  // Write the Firestore profile doc as the admin (still auth'd in primary app).
  const profile = {
    email,
    displayName: displayName ?? '',
    role: 'staff' as const,
    ownerId: adminUid,  // staff belongs to this admin's workspace
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

/**
 * Remove a staff member's Firestore profile.
 * Note: deleting the Firebase Auth account requires the Admin SDK (Cloud
 * Function). This removes the Firestore record so the user can no longer
 * access any org data even if their Auth account persists.
 */
export async function removeStaffProfile(staffUid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', staffUid));
}
