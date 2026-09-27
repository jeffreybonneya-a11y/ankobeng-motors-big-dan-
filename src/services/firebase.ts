import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

// Authoritative project and named database IDs
export const FIREBASE_PROJECT_ID = 'gen-lang-client-0096067245';
export const FIRESTORE_DATABASE_ID = 'ai-studio-ankobengmotorsop-2f8fdb09-d643-44e3-94f6-3596d251ac57';

// Build configuration with environment variable fallbacks
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigData.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigData.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigData.projectId || FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigData.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigData.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigData.appId,
  firestoreDatabaseId: FIRESTORE_DATABASE_ID
};

// Initialize or reuse Firebase App
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth: Auth = getAuth(app);

// Primary Firestore instance explicitly bound to the named database
export const db: Firestore = getFirestore(app, FIRESTORE_DATABASE_ID);

// Secondary reference to default database for diagnostic cross-checks
export const defaultDb: Firestore = getFirestore(app);

export default app;
