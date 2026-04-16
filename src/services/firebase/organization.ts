/**
 * Multi-tenant data helpers.
 *
 * All app data lives under:
 *   organizations/{adminUid}/{collectionName}/{docId}
 *
 * Every document automatically receives:
 *   - ownerId:   the admin's UID (used for Firestore security rules)
 *   - createdBy: the UID of the user who created the record
 *
 * All queries filter by ownerId == currentUser.ownerId so staff can only
 * see their admin's data and never cross into another tenant's workspace.
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  type WithFieldValue,
} from 'firebase/firestore';
import { getFirebase } from './config';

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

/** Returns the Firestore collection ref for organizations/{adminUid}/{col} */
export function orgCollection(adminUid: string, col: string) {
  const { db } = getFirebase();
  return collection(db, 'organizations', adminUid, col);
}

/** Returns a specific document ref inside an org collection */
export function orgDoc(adminUid: string, col: string, docId: string) {
  const { db } = getFirebase();
  return doc(db, 'organizations', adminUid, col, docId);
}

// ---------------------------------------------------------------------------
// Standard fields injected into every document
// ---------------------------------------------------------------------------

interface TenantMeta {
  ownerId: string;
  createdBy: string;
  createdAt: unknown;  // serverTimestamp()
  updatedAt: unknown;  // serverTimestamp()
}

function tenantMeta(ownerId: string, createdBy: string): TenantMeta {
  return {
    ownerId,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

/**
 * Add a new document to an org collection.
 * ownerId and createdBy are injected automatically.
 *
 * @param ownerId   Admin UID (the workspace owner)
 * @param createdBy UID of the user performing the write (admin or staff)
 * @param col       Collection name, e.g. "recipes"
 * @param data      Document fields (without tenant meta)
 * @returns         The newly created document ID
 */
export async function orgAdd<T extends DocumentData>(
  ownerId: string,
  createdBy: string,
  col: string,
  data: WithFieldValue<T>
): Promise<string> {
  const ref = await addDoc(orgCollection(ownerId, col), {
    ...data,
    ...tenantMeta(ownerId, createdBy),
  });
  return ref.id;
}

/**
 * Set (overwrite) a document with a known ID.
 * ownerId and createdBy are injected automatically.
 */
export async function orgSet<T extends DocumentData>(
  ownerId: string,
  createdBy: string,
  col: string,
  docId: string,
  data: WithFieldValue<T>
): Promise<void> {
  await setDoc(orgDoc(ownerId, col, docId), {
    ...data,
    ...tenantMeta(ownerId, createdBy),
  });
}

/**
 * Fetch a single document. Returns null if it does not exist.
 */
export async function orgGet<T>(
  ownerId: string,
  col: string,
  docId: string
): Promise<(T & { id: string }) | null> {
  const snap = await getDoc(orgDoc(ownerId, col, docId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as T) };
}

/**
 * Fetch all documents in a collection, always scoped by ownerId.
 * Additional Firestore constraints (where, orderBy, limit…) can be passed.
 */
export async function orgList<T>(
  ownerId: string,
  col: string,
  ...constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> {
  const q = query(
    orgCollection(ownerId, col),
    where('ownerId', '==', ownerId), // belt-and-suspenders; rules enforce this too
    ...constraints
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
}

/**
 * Partially update a document (merges fields).
 * updatedAt is refreshed automatically.
 */
export async function orgUpdate<T extends DocumentData>(
  ownerId: string,
  col: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  await updateDoc(orgDoc(ownerId, col, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a document from an org collection.
 */
export async function orgDelete(
  ownerId: string,
  col: string,
  docId: string
): Promise<void> {
  await deleteDoc(orgDoc(ownerId, col, docId));
}

// ---------------------------------------------------------------------------
// Convenience re-exports of Firestore constraints so callers don't need to
// import from 'firebase/firestore' directly.
// ---------------------------------------------------------------------------
export { where, orderBy };
