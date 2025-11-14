import { signInWithPopup, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { initializeApp, getApp, getApps } from 'firebase/app';

// Firebase config (must match firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyBs4ePPl25niBHozW6kv2AGou5iw0aG5hQ",
  authDomain: "smarlify-api.firebaseapp.com",
  projectId: "smarlify-api",
  storageBucket: "smarlify-api.firebasestorage.app",
  messagingSenderId: "117162085061",
  appId: "1:117162085061:web:cd64d13eff75941de17eac",
  measurementId: "G-1JZRLPFQVT"
};

// Initialize Firebase (ensure it's only initialized once)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google using popup
 */
export async function signInWithGoogle(): Promise<string | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const displayName = result.user.displayName;
    console.log('Signed in as:', displayName);
    return displayName;
  } catch (error) {
    console.error('Sign-in failed:', error);
    throw error;
  }
}

/**
 * Check if user is logged in with a Google account (not anonymous)
 */
export function isUserLoggedIn(): boolean {
  const user = auth.currentUser;
  return user !== null && !user.isAnonymous;
}

/**
 * Get current user's display name
 */
export function getCurrentUserName(): string | null {
  const user = auth.currentUser;
  if (user && !user.isAnonymous && user.displayName) {
    return user.displayName;
  }
  return null;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (isLoggedIn: boolean) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    const isLoggedIn = user !== null && !user.isAnonymous;
    callback(isLoggedIn);
  });
}

/**
 * Get current user info
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Get auth instance
 */
export function getAuthInstance() {
  return auth;
}

