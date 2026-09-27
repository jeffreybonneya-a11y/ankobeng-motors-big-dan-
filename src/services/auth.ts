import { 
  GoogleAuthProvider,
  signInWithPopup,
  signOut, 
  onAuthStateChanged, 
  User, 
  UserCredential 
} from 'firebase/auth';
import { auth, db, FIREBASE_PROJECT_ID, FIRESTORE_DATABASE_ID } from './firebase';

export const ALLOWED_ADMIN_EMAIL = '10362581@upsamail.edu.gh';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export interface AdminRecord {
  email: string;
  displayName?: string;
  role: 'admin' | 'superadmin' | string;
  active: boolean;
  createdAt?: any;
}

export type AuthDiagnosticResult = 
  | 'AUTHORIZED'
  | 'UNAUTHORIZED_EMAIL'
  | 'NOT_AUTHENTICATED';

export interface AdminStatusInspection {
  firebaseProjectId: string;
  firestoreDatabaseId: string;
  actualDbDatabaseId: string;
  expectedFirestorePath: string;
  authenticatedEmail: string;
  firebaseUid: string;
  collectionQueried?: string;
  documentIdQueried?: string;
  documentExists?: boolean;
  activeStatus?: boolean;
  isAllowedEmail: boolean;
  authorizationResult: AuthDiagnosticResult;
  adminRecord: AdminRecord | null;
  errorCode?: string | null;
  errorMessage: string | null;
  rawDocData?: any;
  databaseQueried?: 'NAMED' | 'DEFAULT' | 'NONE';
}

/**
 * Checks if the given email matches the single authorized administrator
 */
export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === ALLOWED_ADMIN_EMAIL.toLowerCase();
}

/**
 * Authenticate with Google Sign-In ONLY
 * Enforces immediate sign-out and rejection if authenticated account is not 10362581@upsamail.edu.gh
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const credential: UserCredential = await signInWithPopup(auth, googleProvider);
    const user = credential.user;

    const email = user.email || '';

    // Strict validation: ONLY 10362581@upsamail.edu.gh is permitted
    if (!isAuthorizedAdminEmail(email)) {
      // Immediately sign out unauthorized account
      await signOut(auth);
      throw new Error(
        `Access Denied: Google account "${email || 'Unknown'}" is not authorized. Only ${ALLOWED_ADMIN_EMAIL} can access the administration portal.`
      );
    }

    return user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. The Google window was closed before completion.');
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
    }
    if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in request was replaced by another attempt.');
    }
    throw error;
  }
}

/**
 * Inspect admin status for an authenticated user
 */
export async function inspectAdminStatus(user: User): Promise<AdminStatusInspection> {
  const uid = user.uid;
  const email = user.email || '';
  const isAllowed = isAuthorizedAdminEmail(email);
  const actualDbId = (db as any)._databaseId?.database || FIRESTORE_DATABASE_ID;

  let adminRecord: AdminRecord | null = null;
  let authResult: AuthDiagnosticResult = 'UNAUTHORIZED_EMAIL';
  let errorMessage: string | null = null;

  if (isAllowed) {
    adminRecord = {
      email,
      displayName: user.displayName || 'Big Dan Admin',
      role: 'superadmin',
      active: true
    };
    authResult = 'AUTHORIZED';
  } else {
    errorMessage = `Account "${email || 'Unknown'}" is not authorized. Only ${ALLOWED_ADMIN_EMAIL} is granted administrator access.`;
  }

  return {
    firebaseProjectId: FIREBASE_PROJECT_ID,
    firestoreDatabaseId: FIRESTORE_DATABASE_ID,
    actualDbDatabaseId: actualDbId,
    expectedFirestorePath: `admins/${uid}`,
    authenticatedEmail: email,
    firebaseUid: uid,
    isAllowedEmail: isAllowed,
    authorizationResult: authResult,
    adminRecord,
    errorMessage
  };
}

/**
 * Sign out current admin user
 */
export async function signOutAdmin(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Error signing out.');
  }
}

/**
 * Subscribe to Firebase Auth state changes
 * Automatically purges and signs out any session not matching 10362581@upsamail.edu.gh
 */
export function subscribeToAuth(
  callback: (user: User | null, isAuthorized: boolean) => void
): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null, false);
      return;
    }

    const email = user.email || '';
    if (!isAuthorizedAdminEmail(email)) {
      // Immediate sign out for unauthorized account
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Failed to sign out unauthorized user:', err);
      }
      callback(null, false);
      return;
    }

    callback(user, true);
  });
}

/**
 * Get current authenticated user
 */
export function getCurrentAdminUser(): User | null {
  const user = auth.currentUser;
  if (!user || !isAuthorizedAdminEmail(user.email)) {
    return null;
  }
  return user;
}
