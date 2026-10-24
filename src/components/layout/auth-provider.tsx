"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, ensureMemberProfile, firestore, profileLoadError } from "@/lib/firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { UserProfile } from "@/types/user";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const firebaseAuth = auth;
    const database = firestore;
    if (!firebaseAuth || !database) {
      setLoading(false);
      return;
    }
    let active = true;
    let unsubscribeProfile: (() => void) | undefined;
    let creatingProfile = false;
    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      if (!active) return;
      unsubscribeProfile?.();
      creatingProfile = false;
      setUser(nextUser);
      setProfile(null);
      setError(null);
      if (!nextUser) {
        setLoading(false);
        return;
      }
      setLoading(true);
      unsubscribeProfile = onSnapshot(doc(database, "users", nextUser.uid), (snapshot) => {
        if (!active) return;
        if (snapshot.exists()) {
          const data = snapshot.data();
          const role = data.role === "platformAdmin" || data.role === "cohortAdmin" ? data.role : "member";
          setError(null);
          setProfile({
            uid: nextUser.uid,
            displayName: data.displayName ?? nextUser.displayName ?? "Anggota HortiKita",
            username: data.username ?? nextUser.uid.slice(0, 8),
            photoURL: data.photoURL === null ? null : typeof data.photoURL === "string" ? data.photoURL : nextUser.photoURL,
            bio: typeof data.bio === "string" ? data.bio : "",
            cohortId: role === "cohortAdmin" && typeof data.cohortId === "string" ? data.cohortId : null,
            role,
          });
          setLoading(false);
        } else if (snapshot.metadata.fromCache) {
          setError(profileLoadError({ code: "unavailable" }));
          setLoading(false);
        } else {
          if (creatingProfile) return;
          creatingProfile = true;
          void ensureMemberProfile(nextUser).catch((cause: unknown) => {
            if (!active) return;
            creatingProfile = false;
            setError(profileLoadError(cause));
            setLoading(false);
          });
        }
      }, (cause: Error) => {
        if (!active) return;
        setError(profileLoadError(cause));
        setLoading(false);
      });
    });
    return () => {
      active = false;
      unsubscribe();
      unsubscribeProfile?.();
    };
  }, []);

  const value = useMemo(() => ({ user, profile, loading, configured: isFirebaseConfigured, error }), [user, profile, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  return context;
}
