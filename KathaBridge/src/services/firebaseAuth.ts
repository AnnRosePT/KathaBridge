import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";
import { UserProfile } from "../types";
import { StorageService } from "./storageService";

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

const CONFIG_STORAGE_KEY = "kathabridge_firebase_config_v1";

// Resolve config from environment variables or custom localStorage override
export function getActiveFirebaseConfig(): FirebaseClientConfig | null {
  try {
    const custom = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read custom Firebase config from localStorage", err);
  }

  const env = import.meta.env;
  if (
    env.VITE_FIREBASE_API_KEY &&
    env.VITE_FIREBASE_API_KEY.length > 10 &&
    !env.VITE_FIREBASE_API_KEY.includes("your_firebase_api_key")
  ) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: env.VITE_FIREBASE_PROJECT_ID || "",
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: env.VITE_FIREBASE_APP_ID || ""
    };
  }

  return null;
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

function initFirebase() {
  const cfg = getActiveFirebaseConfig();
  if (!cfg || !cfg.apiKey || !cfg.projectId) {
    firebaseApp = null;
    firebaseAuth = null;
    googleProvider = null;
    return;
  }

  try {
    firebaseApp = getApps().length === 0 ? initializeApp(cfg) : getApp();
    firebaseAuth = getAuth(firebaseApp);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
  } catch (err) {
    console.warn("Failed to initialize Firebase app:", err);
  }
}

// Initial initialization attempt
initFirebase();

export function isFirebaseLive(): boolean {
  return firebaseAuth !== null;
}

export function saveCustomFirebaseConfig(config: FirebaseClientConfig) {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  initFirebase();
}

export function clearCustomFirebaseConfig() {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
  initFirebase();
}

// Transform Firebase User to KathaBridge UserProfile
export function mapFirebaseUserToProfile(
  user: FirebaseUser,
  role: "READER" | "CONTRIBUTOR" | "REVIEWER" | "SCHOLAR" = "READER"
): UserProfile {
  const displayName = user.displayName || user.email?.split("@")[0] || "Cultural Reader";
  const nameParts = displayName.trim().split(" ");
  const initials =
    nameParts.length > 1
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : displayName.slice(0, 2).toUpperCase();

  const existing = StorageService.getUser();
  const favoriteStoryIds = existing?.favoriteStoryIds?.length
    ? existing.favoriteStoryIds
    : StorageService.getFavorites();

  return {
    id: user.uid,
    name: displayName,
    email: user.email || "",
    role: existing?.role || role,
    avatarInitials: initials,
    photoURL: user.photoURL || undefined,
    authProvider: user.providerData?.[0]?.providerId === "google.com" ? "google" : "password",
    favoriteStoryIds,
    readingHistory: existing?.readingHistory || [],
    preferredLanguage: "EN",
    joinedDate: user.metadata.creationTime ? new Date(user.metadata.creationTime).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    isRealAuth: true
  };
}

// 1. Real Google Authentication via Popup
export async function loginWithGoogle(): Promise<UserProfile> {
  if (!firebaseAuth || !googleProvider) {
    throw new Error(
      "Firebase is not configured. Please supply your Firebase credentials in .env or the Config tab to enable real Google OAuth."
    );
  }

  const result = await signInWithPopup(firebaseAuth, googleProvider);
  const profile = mapFirebaseUserToProfile(result.user, "READER");
  StorageService.setUser(profile);
  return profile;
}

// 2. Real Email & Password Login
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  if (!firebaseAuth) {
    throw new Error(
      "Firebase is not configured. Please supply your Firebase credentials in .env or the Config tab to enable real Email Authentication."
    );
  }

  const cred = await signInWithEmailAndPassword(firebaseAuth, email, pass);
  const profile = mapFirebaseUserToProfile(cred.user);
  StorageService.setUser(profile);
  return profile;
}

// 3. Real Email & Password Registration
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  role: "READER" | "CONTRIBUTOR" | "REVIEWER" | "SCHOLAR" = "READER"
): Promise<UserProfile> {
  if (!firebaseAuth) {
    throw new Error(
      "Firebase is not configured. Please supply your Firebase credentials in .env or the Config tab to enable real Email Authentication."
    );
  }

  const cred = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
  if (displayName && cred.user) {
    try {
      await updateProfile(cred.user, { displayName });
    } catch (e) {
      console.warn("Could not set displayName on Firebase user:", e);
    }
  }

  const profile = mapFirebaseUserToProfile(cred.user, role);
  StorageService.setUser(profile);
  return profile;
}

// 4. Real Password Reset Email
export async function sendResetPassword(email: string): Promise<void> {
  if (!firebaseAuth) {
    throw new Error("Firebase is not configured. Unable to send password reset email.");
  }
  await sendPasswordResetEmail(firebaseAuth, email);
}

// 5. Real Sign Out
export async function logoutFirebaseUser(): Promise<void> {
  if (firebaseAuth) {
    try {
      await signOut(firebaseAuth);
    } catch (err) {
      console.warn("Firebase sign out error:", err);
    }
  }
  StorageService.setUser(null);
}

// 6. Real Auth State Observer
export function subscribeToAuthChanges(callback: (user: UserProfile | null) => void): () => void {
  if (!firebaseAuth) {
    // If not using live Firebase, just return a no-op cleanup
    return () => {};
  }

  const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
    if (user) {
      const profile = mapFirebaseUserToProfile(user);
      StorageService.setUser(profile);
      callback(profile);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}
