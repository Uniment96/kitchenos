#!/usr/bin/env node
/**
 * Creates a test admin user via the Firebase Auth + Firestore REST APIs.
 * Mirrors exactly what signUpAdmin() does in src/services/firebase/auth.ts.
 *
 * Usage:
 *   node scripts/create-test-user.mjs
 */

const API_KEY    = 'AIzaSyDx9zM_V9ltigjRfNo7yRxV4ZU3U_dLvDM';
const PROJECT_ID = 'kitchenos-66faf';

const TEST_EMAIL       = 'admin@kitchenos.test';
const TEST_PASSWORD    = 'Test@1234';
const TEST_DISPLAY_NAME = 'Test Admin';

async function createAdmin(email, password, displayName) {
  // ── 1. Create Firebase Auth user ──────────────────────────────────────────
  const authRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  const authData = await authRes.json();
  if (!authRes.ok) {
    throw new Error(`Auth error: ${authData.error?.message}`);
  }

  const { localId: uid, idToken } = authData;

  // ── 2. Write user profile to Firestore users/{uid} ────────────────────────
  const now = new Date().toISOString();
  const firestoreRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        fields: {
          email:       { stringValue: email },
          displayName: { stringValue: displayName },
          role:        { stringValue: 'admin' },
          ownerId:     { stringValue: uid },      // admin owns themselves
          createdBy:   { stringValue: uid },
          createdAt:   { timestampValue: now },
          updatedAt:   { timestampValue: now },
        },
      }),
    }
  );

  const fsData = await firestoreRes.json();
  if (!firestoreRes.ok) {
    throw new Error(`Firestore error: ${JSON.stringify(fsData.error)}`);
  }

  return { uid, email, displayName, role: 'admin', ownerId: uid };
}

createAdmin(TEST_EMAIL, TEST_PASSWORD, TEST_DISPLAY_NAME)
  .then((u) => {
    console.log('\n✓ Test admin created\n');
    console.log('  Email   :', u.email);
    console.log('  Password:', TEST_PASSWORD);
    console.log('  Name    :', u.displayName);
    console.log('  UID     :', u.uid);
    console.log('  Role    :', u.role);
    console.log('\nYou can now sign in with these credentials.\n');
  })
  .catch((err) => {
    if (err.message.includes('EMAIL_EXISTS')) {
      console.log('\n⚠  User already exists — sign in with:');
      console.log('  Email   :', TEST_EMAIL);
      console.log('  Password:', TEST_PASSWORD);
      console.log();
    } else {
      console.error('\n✗', err.message);
      process.exit(1);
    }
  });
