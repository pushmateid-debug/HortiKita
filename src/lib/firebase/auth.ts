import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { UserProfile } from "@/types/user";
import { firebaseApp } from "./config";

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;

function requireFirebase() {
  if (!auth || !firestore) {
    throw new Error("Firebase belum dikonfigurasi. Isi variabel NEXT_PUBLIC_FIREBASE_* di .env.local.");
  }
  return { auth, firestore };
}

export async function getUserProfile(user: User) {
  const { firestore } = requireFirebase();
  const profileRef = doc(firestore, "users", user.uid);
  const profile = await getDoc(profileRef);
  if (!profile.exists()) return null;
  const data = profile.data();
  return {
    uid: user.uid,
    displayName: data.displayName ?? user.displayName ?? "Anggota HortiKita",
    username: data.username ?? user.uid.slice(0, 8),
    cohortId: typeof data.cohortId === "string" ? data.cohortId : null,
    role: data.role === "platformAdmin" || data.role === "cohortAdmin" ? data.role : "member",
  } satisfies UserProfile;
}

async function createMemberProfile(user: User, displayName?: string, cohortId?: string) {
  const { firestore } = requireFirebase();
  const profileRef = doc(firestore, "users", user.uid);
  const existingProfile = await getDoc(profileRef);
  if (existingProfile.exists()) return;

  const name = displayName?.trim() || user.displayName || user.email?.split("@")[0] || "Anggota";
  await setDoc(profileRef, {
    displayName: name,
    username: user.uid.slice(0, 12),
    email: user.email ?? null,
    photoURL: user.photoURL,
    cohortId: cohortId || null,
    role: "member",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
  cohortId: string,
) {
  const { auth } = requireFirebase();
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(result.user, { displayName: displayName.trim() });
  await createMemberProfile(result.user, displayName, cohortId);
  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const { auth } = requireFirebase();
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signInWithGoogle() {
  const { auth } = requireFirebase();
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  await createMemberProfile(result.user);
  return result.user;
}

export async function signOutUser() {
  const { auth } = requireFirebase();
  await signOut(auth);
}
