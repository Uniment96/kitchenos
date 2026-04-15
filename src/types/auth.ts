export type UserRole = 'admin' | 'staff';

/**
 * Stored in users/{uid} in Firestore.
 * - Admin: ownerId === uid (they own themselves)
 * - Staff: ownerId === their admin's uid
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  /** Admin's own uid; for staff this is the admin who created them */
  ownerId: string;
  createdAt: Date;
  /** uid of the account that created this user (undefined for self-registered admins) */
  createdBy?: string;
}

/** Runtime shape held in the auth store */
export interface AuthUser {
  uid: string;
  email: string | null;
  profile: UserProfile | null;
}
