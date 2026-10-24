"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/layout/auth-provider";
import { signOutUser } from "@/lib/firebase/auth";

export function ProfileContent({ username }: { username: string }) {
  const router = useRouter();
  const { user, profile, loading, configured } = useAuth();
  const [error, setError] = useState("");
  const ownsProfile = Boolean(profile && (profile.username === username || profile.uid === username));

  async function handleSignOut() {
    setError("");
    try {
      await signOutUser();
      router.replace("/");
    } catch {
      setError("Keluar belum berhasil. Periksa koneksi dan coba lagi.");
    }
  }

  if (configured && loading) return <div className="loading-state" role="status">Memuat profil...</div>;
  if (!configured) return <div className="access-card"><span className="access-icon">◉</span><p className="eyebrow">Profil anggota</p><h1>@{username}</h1><p>Profil pengguna akan tersedia setelah anggota terdaftar dan mengatur informasi publiknya.</p><Link className="button" href="/register">Buat akun HortiKita</Link></div>;
  if (!user || !ownsProfile || !profile) return <div className="access-card"><span className="access-icon">◉</span><p className="eyebrow">Profil anggota</p><h1>Profil tidak tersedia</h1><p>Profil ini belum dipublikasikan atau tidak dapat diakses. Informasi akun pribadi hanya dibaca oleh pemiliknya.</p><Link className="button button-outline" href="/login">Masuk ke akun</Link></div>;

  const initials = profile.displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("id");
  return <section className="profile-page">
    <div className="profile-cover" />
    <div className="profile-heading"><div className="profile-avatar">{user.photoURL ? <img src={user.photoURL} alt="" /> : initials}</div><div className="profile-heading-copy"><p className="eyebrow">Anggota HortiKita</p><h1>{profile.displayName}</h1><p>@{profile.username}</p></div><button type="button" className="button button-outline" onClick={handleSignOut}>Keluar</button></div>
    {error && <p role="alert" className="notice-box notice-error">{error}</p>}
    <div className="profile-details"><div><span>Angkatan</span><strong>{profile.cohortId?.replace("angkatan-", "Angkatan ") ?? "Belum dipilih"}</strong></div><div><span>Peran</span><strong>{profile.role === "member" ? "Anggota" : profile.role === "cohortAdmin" ? "Admin angkatan" : "Admin platform"}</strong></div><div><span>Email akun</span><strong>{user.email ?? "Tidak tersedia"}</strong></div></div>
    <div className="profile-content-empty"><span className="eyebrow">Cerita & karya</span><h2>Ruang ini masih menunggu ceritamu.</h2><p>Postingan dan karya anggota akan muncul di sini setelah fitur publikasi tersambung ke Firestore.</p><Link className="text-link" href="/community">Jelajahi komunitas →</Link></div>
  </section>;
}
