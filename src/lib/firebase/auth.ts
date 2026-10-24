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
  updateDoc,
} from "firebase/firestore";
import type { EditableProfile, MembershipRequest, UserProfile } from "@/types/user";
import { firebaseApp } from "./config";

const isBrowser = typeof window !== "undefined";
export const auth = firebaseApp && isBrowser ? getAuth(firebaseApp) : null;
export const firestore = firebaseApp && isBrowser ? getFirestore(firebaseApp) : null;

function requireFirebase() {
  if (!auth || !firestore) {
    throw new Error("Firebase belum dikonfigurasi. Isi variabel NEXT_PUBLIC_FIREBASE_* di .env.local.");
  }
  return { auth, firestore };
}

export function profileLoadError(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (code === "unavailable") {
    return "Login berhasil, tetapi Firestore belum dapat dihubungi. Pastikan Cloud Firestore API aktif, database (default) tersedia di project Firebase ini, dan koneksi internet berfungsi.";
  }
  if (code === "permission-denied") {
    return "Login berhasil, tetapi Security Rules Firestore menolak akses profil. Periksa aturan yang aktif untuk dokumen users/{uid}.";
  }
  if (code === "not-found" || code === "failed-precondition") {
    return "Login berhasil, tetapi database Firestore belum tersedia atau belum siap di project Firebase ini.";
  }
  return "Login berhasil, tetapi profil belum dapat dimuat atau disiapkan. Periksa koneksi Firestore dan aturan akses.";
}

export async function getUserProfile(user: User) {
  const { firestore } = requireFirebase();
  const profileRef = doc(firestore, "users", user.uid);
  const profile = await getDoc(profileRef);
  if (!profile.exists()) return null;
  const data = profile.data();
  const role = data.role === "platformAdmin" || data.role === "cohortAdmin" ? data.role : "member";
  return {
    uid: user.uid,
    displayName: data.displayName ?? user.displayName ?? "Anggota HortiKita",
    username: data.username ?? user.uid.slice(0, 8),
    photoURL: data.photoURL === null ? null : typeof data.photoURL === "string" ? data.photoURL : user.photoURL,
    bio: typeof data.bio === "string" ? data.bio : "",
    cohortId: role === "cohortAdmin" && typeof data.cohortId === "string" ? data.cohortId : null,
    role,
  } satisfies UserProfile;
}

export async function ensureMemberProfile(user: User, displayName?: string) {
  const { firestore } = requireFirebase();
  const profileRef = doc(firestore, "users", user.uid);
  const existingProfile = await getDoc(profileRef);
  if (existingProfile.exists()) return;

  const name = displayName?.trim() || user.displayName || user.email?.split("@")[0] || "Anggota";
  await setDoc(profileRef, {
    displayName: name,
    username: user.uid.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) || "anggota",
    email: user.email ?? null,
    photoURL: user.photoURL ?? null,
    bio: "",
    cohortId: null,
    role: "member",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
) {
  const { auth } = requireFirebase();
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(result.user, { displayName: displayName.trim() });
  await ensureMemberProfile(result.user, displayName);
  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const { auth } = requireFirebase();
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signInWithGoogle() {
  const { auth } = requireFirebase();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function saveUserProfile(user: User, profile: EditableProfile) {
  const { firestore } = requireFirebase();
  await updateDoc(doc(firestore, "users", user.uid), {
    ...profile,
    updatedAt: serverTimestamp(),
  });
}

function membershipRequestId(uid: string, cohortId: string) {
  return `${uid}_${cohortId}`;
}

export async function getMembershipRequest(user: User, cohortId: string): Promise<MembershipRequest | null> {
  const { firestore } = requireFirebase();
  const snapshot = await getDoc(doc(firestore, "membershipRequests", membershipRequestId(user.uid, cohortId)));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const status = data.status;
  if (status !== "pending" && status !== "approved" && status !== "rejected") {
    throw new Error("Status permintaan keanggotaan tidak valid.");
  }
  return { cohortId: data.cohortId, status };
}

export async function requestCohortMembership(user: User, cohortId: string) {
  const { firestore } = requireFirebase();
  const requestRef = doc(firestore, "membershipRequests", membershipRequestId(user.uid, cohortId));
  const existing = await getDoc(requestRef);
  if (existing.exists()) {
    if (existing.data().status !== "rejected") {
      throw new Error("Permintaan untuk angkatan ini sudah tercatat.");
    }
    await updateDoc(requestRef, {
      status: "pending",
      updatedAt: serverTimestamp(),
    });
    return;
  }
  await setDoc(requestRef, {
    userId: user.uid,
    cohortId,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function signOutUser() {
  const { auth } = requireFirebase();
  await signOut(auth);
}
