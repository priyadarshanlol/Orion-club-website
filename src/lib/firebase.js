import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  OAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  updateDoc, 
  deleteDoc,
  writeBatch,
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Read env variables or fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForClubOrionReva2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "club-orion-reva.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "club-orion-reva",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "club-orion-reva.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "109231704438",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:109231704438:web:17281dbad336e4ab92d257"
};

// Check if actual valid Firebase credentials exist
export const isLiveFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_API_KEY !== "AIzaSyDemoKeyForClubOrionReva2026"
);

// Initialize Firebase
let app, auth, db, storage, microsoftProvider;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Microsoft OAuth Provider configured for REVA Azure AD / Microsoft 365
  microsoftProvider = new OAuthProvider('microsoft.com');
  microsoftProvider.setCustomParameters({
    prompt: 'select_account',
    domain_hint: 'reva.edu.in',
    tenant: 'common'
  });
  microsoftProvider.addScope('openid');
  microsoftProvider.addScope('profile');
  microsoftProvider.addScope('email');
  microsoftProvider.addScope('User.Read');
} catch (error) {
  console.warn("Firebase initialization warning (using local fallback mode):", error);
}

export { 
  app, 
  auth, 
  db, 
  storage, 
  microsoftProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  updateDoc, 
  deleteDoc,
  writeBatch,
  increment, 
  serverTimestamp
};
