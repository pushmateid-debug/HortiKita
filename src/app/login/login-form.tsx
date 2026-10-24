"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/layout/auth-provider";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase/auth";

const firebaseError = (error: unknown) => {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password") || code.includes("auth/user-not-found")) return "Email atau kata sandi belum sesuai.";
  if (code.includes("auth/too-many-requests")) return "Terlalu banyak percobaan. Coba lagi beberapa saat.";
  if (code.includes("auth/popup-closed-by-user")) return "Jendela masuk Google ditutup sebelum selesai.";
  if (error instanceof Error) return error.message;
  return "Masuk gagal. Periksa koneksi dan coba lagi.";
};

export function LoginForm() {
  const router = useRouter();
  const { user, profile, loading, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && profile) router.replace(profile.role === "cohortAdmin" || profile.role === "platformAdmin" ? "/dashboard" : `/profile/${profile.uid}`);
  }, [user, profile, router]);

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await signInWithEmail(email, password);
      router.push(`/profile/${result.user.uid}`);
    } catch (cause) {
      setError(firebaseError(cause));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setBusy(true);
    try {
      const result = await signInWithGoogle();
      router.push(`/profile/${result.uid}`);
    } catch (cause) {
      setError(firebaseError(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-art">
        <Link className="brand auth-brand" href="/"><img src="/logo.svg" alt="" width="40" height="40" />Horti<span className="brand-highlight">Kita</span></Link>
        <div><span className="auth-leaf" aria-hidden="true">✳</span><p className="eyebrow">Senang kamu kembali</p><h1>Setiap cerita tumbuh dari <span>rumahnya.</span></h1><p>Masuk untuk terhubung lagi dengan teman, karya, dan kabar dari kebun.</p></div>
        <span className="auth-art-caption">Komunitas PTH · Jember</span>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-card">
          <p className="eyebrow">Selamat datang kembali</p><h2>Masuk ke HortiKita</h2><p className="muted">Gunakan akun yang sudah kamu daftarkan.</p>
          {!configured && <div className="notice-box notice-warning" role="status">Firebase belum dikonfigurasi. Isi variabel di <code>.env.local</code> untuk mengaktifkan login.</div>}
          {error && <div className="notice-box notice-error" role="alert">{error}</div>}
          <form className="auth-form" onSubmit={handleEmailLogin}>
            <label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" /></label>
            <label>Kata sandi<input type="password" autoComplete="current-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 6 karakter" /></label>
            <button className="button auth-submit" disabled={!configured || busy || loading}>{busy ? "Memeriksa akun..." : "Masuk"}</button>
          </form>
          <div className="auth-divider"><span>atau</span></div>
          <button className="button button-outline google-button" onClick={handleGoogleLogin} disabled={!configured || busy || loading}><span className="google-mark" aria-hidden="true">G</span> Masuk dengan Google</button>
          <p className="muted">Akun Google pribadi maupun kampus dapat digunakan.</p>
          <p className="auth-switch">Belum punya akun? <Link href="/register">Daftar di sini</Link></p>
        </div>
      </div>
    </section>
  );
}
