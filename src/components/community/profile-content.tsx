"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/layout/auth-provider";
import {
  getMembershipRequest,
  requestCohortMembership,
  saveUserProfile,
  signOutUser,
} from "@/lib/firebase/auth";
import type { EditableProfile, MembershipRequestStatus } from "@/types/user";

const cohortOptions = [
  { id: "angkatan-24", label: "Angkatan 2024" },
  { id: "angkatan-25", label: "Angkatan 2025" },
  { id: "angkatan-26", label: "Angkatan 2026" },
  { id: "angkatan-27", label: "Angkatan 2027" },
  ...Array.from({ length: 8 }, (_, index) => {
    const year = 2028 + index;
    return { id: `angkatan-${year}`, label: `Angkatan ${year}` };
  }),
];

export function ProfileContent({ username }: { username: string }) {
  const router = useRouter();
  const { user, profile, loading, configured, error: authError } = useAuth();
  const [profileForm, setProfileForm] = useState<EditableProfile | null>(null);
  const [selectedCohort, setSelectedCohort] = useState("");
  const [membershipStatus, setMembershipStatus] = useState<MembershipRequestStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const ownsProfile = Boolean(profile && (profile.uid === username || profile.username === username));

  useEffect(() => {
    if (!profile) return;
    setProfileForm({
      displayName: profile.displayName,
      username: profile.username,
      photoURL: profile.photoURL,
      bio: profile.bio,
    });
  }, [profile]);

  useEffect(() => {
    if (!user || !selectedCohort) {
      setMembershipStatus(null);
      return;
    }
    let active = true;
    setRequestLoading(true);
    void getMembershipRequest(user, selectedCohort)
      .then((request) => {
        if (active) setMembershipStatus(request?.status ?? null);
      })
      .catch(() => {
        if (active) setError("Status permintaan keanggotaan belum dapat dimuat.");
      })
      .finally(() => {
        if (active) setRequestLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, selectedCohort]);

  async function handleSignOut() {
    setError("");
    try {
      await signOutUser();
      router.replace("/");
    } catch {
      setError("Keluar belum berhasil. Periksa koneksi dan coba lagi.");
    }
  }

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !profileForm) return;
    setError("");
    setMessage("");

    const displayName = profileForm.displayName.trim();
    const usernameValue = profileForm.username.trim().toLowerCase();
    const bio = profileForm.bio.trim();
    let photoURL: string | null = profileForm.photoURL?.trim() || null;
    if (displayName.length < 2 || displayName.length > 80) {
      setError("Nama harus terdiri dari 2 sampai 80 karakter.");
      return;
    }
    if (!/^[a-z0-9._-]{3,24}$/.test(usernameValue)) {
      setError("Username harus 3–24 karakter: huruf kecil, angka, titik, garis bawah, atau strip.");
      return;
    }
    if (bio.length > 280) {
      setError("Bio maksimal 280 karakter.");
      return;
    }
    if (photoURL) {
      try {
        const parsedUrl = new URL(photoURL);
        if (parsedUrl.protocol !== "https:") throw new Error("HTTPS required");
        photoURL = parsedUrl.toString();
      } catch {
        setError("URL foto profil harus menggunakan HTTPS yang valid.");
        return;
      }
    }

    setBusy(true);
    try {
      await saveUserProfile(user, { displayName, username: usernameValue, bio, photoURL });
      setMessage("Profil berhasil diperbarui.");
    } catch {
      setError("Profil gagal disimpan. Periksa koneksi dan aturan Firestore.");
    } finally {
      setBusy(false);
    }
  }

  async function handleMembershipRequest() {
    if (!user || !selectedCohort) return;
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await requestCohortMembership(user, selectedCohort);
      setMembershipStatus("pending");
      setMessage("Permintaan bergabung dikirim dan menunggu verifikasi pengurus.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Permintaan keanggotaan gagal dikirim.");
    } finally {
      setBusy(false);
    }
  }

  if (configured && loading) return <div className="loading-state" role="status">Memuat profil...</div>;
  if (!configured) return <div className="access-card"><span className="access-icon">◉</span><p className="eyebrow">Profil anggota</p><h1>@{username}</h1><p>Profil pengguna akan tersedia setelah anggota terdaftar dan mengatur informasi publiknya.</p><Link className="button" href="/register">Buat akun HortiKita</Link></div>;
  if (!user || !ownsProfile || !profile) return <div className="access-card"><span className="access-icon">◉</span><p className="eyebrow">Profil anggota</p><h1>Profil tidak tersedia</h1><p>{authError ?? "Profil ini belum dipublikasikan atau tidak dapat diakses. Informasi akun pribadi hanya dibaca oleh pemiliknya."}</p><Link className="button button-outline" href="/login">Masuk ke akun</Link></div>;
  if (!profileForm) return <div className="loading-state" role="status">Menyiapkan profil...</div>;

  const initials = profile.displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("id");
  const membershipLabel = membershipStatus === "approved"
    ? "Terverifikasi"
    : membershipStatus === "pending"
      ? "Menunggu verifikasi"
      : membershipStatus === "rejected"
        ? "Permintaan ditolak"
        : "Belum mengajukan";

  return <section className="profile-page">
    <div className="profile-cover" />
    <div className="profile-heading"><div className="profile-avatar">{profileForm.photoURL ? <img src={profileForm.photoURL} alt="" /> : initials}</div><div className="profile-heading-copy"><p className="eyebrow">Akun pribadi · UID terhubung ke Firebase Auth</p><h1>{profile.displayName}</h1><p>@{profile.username}</p></div><button type="button" className="button button-outline" onClick={handleSignOut}>Keluar</button></div>
    {error && <p role="alert" className="notice-box notice-error">{error}</p>}
    {message && <p role="status" className="notice-box notice-success">{message}</p>}
    <div className="profile-details"><div><span>Angkatan terverifikasi</span><strong>{profile.role === "cohortAdmin" ? profile.cohortId?.replace("angkatan-", "Angkatan ") ?? "Tidak ditetapkan" : selectedCohort ? `${cohortOptions.find((option) => option.id === selectedCohort)?.label ?? selectedCohort} · ${membershipLabel}` : "Belum dipilih"}</strong></div><div><span>Peran akun</span><strong>{profile.role === "member" ? "Anggota" : profile.role === "cohortAdmin" ? "Admin angkatan" : "Admin platform"}</strong></div><div><span>Email akun</span><strong>{user.email ?? "Tidak tersedia"}</strong></div></div>
    <section className="profile-settings">
      <div><p className="eyebrow">Profil individu</p><h2>Informasi akun</h2><p className="muted">Username adalah nama tampilan; Firebase UID tetap menjadi identitas utama akun.</p></div>
      <form className="auth-form profile-edit-form" onSubmit={handleSaveProfile}>
        <label>Nama<input autoComplete="name" maxLength={80} required value={profileForm.displayName} onChange={(event) => setProfileForm({ ...profileForm, displayName: event.target.value })} /></label>
        <label>Username<input autoComplete="username" maxLength={24} required value={profileForm.username} onChange={(event) => setProfileForm({ ...profileForm, username: event.target.value })} /></label>
        <label>URL foto profil<input type="url" value={profileForm.photoURL ?? ""} onChange={(event) => setProfileForm({ ...profileForm, photoURL: event.target.value || null })} placeholder="https://..." /></label>
        <label>Bio<textarea rows={3} maxLength={280} value={profileForm.bio} onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })} /></label>
        <button className="button" type="submit" disabled={busy}>{busy ? "Menyimpan..." : "Simpan profil"}</button>
      </form>
    </section>
    <section className="profile-settings">
      <div><p className="eyebrow">Keanggotaan komunitas</p><h2>Ajukan bergabung ke angkatan</h2><p className="muted">Pilihan angkatan hanya mengirim permintaan. Keanggotaan dianggap terverifikasi setelah disetujui pengurus.</p></div>
      <div className="membership-request-form">
        <label htmlFor="membership-cohort">Pilih angkatan</label>
        <select id="membership-cohort" value={selectedCohort} onChange={(event) => setSelectedCohort(event.target.value)}>
          <option value="">Pilih angkatan</option>
          {cohortOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
        {selectedCohort && <p className="muted" role="status">{requestLoading ? "Memeriksa status..." : membershipLabel}</p>}
        <button className="button button-outline" type="button" disabled={!selectedCohort || busy || requestLoading || membershipStatus === "pending" || membershipStatus === "approved"} onClick={handleMembershipRequest}>
          {membershipStatus === "rejected" ? "Ajukan ulang" : "Ajukan keanggotaan"}
        </button>
      </div>
    </section>
    <div className="profile-content-empty"><span className="eyebrow">Cerita & karya</span><h2>Ruang ini masih menunggu ceritamu.</h2><p>Postingan dan karya anggota akan muncul di sini setelah fitur publikasi tersambung ke Firestore.</p><Link className="text-link" href="/community">Jelajahi komunitas →</Link></div>
  </section>;
}
