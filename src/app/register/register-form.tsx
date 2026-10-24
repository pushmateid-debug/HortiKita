"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/layout/auth-provider";
import { registerWithEmail } from "@/lib/firebase/auth";

export function RegisterForm() {
  const router = useRouter();
  const { configured } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cohort, setCohort] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await registerWithEmail(email, password, name, cohort);
      router.push(`/profile/${user.uid.slice(0, 12)}`);
    } catch (cause) {
      const code = typeof cause === "object" && cause !== null && "code" in cause ? String(cause.code) : "";
      setError(code.includes("auth/email-already-in-use") ? "Email ini sudah terdaftar. Coba masuk ke akunmu." : cause instanceof Error ? cause.message : "Pendaftaran gagal. Periksa koneksi dan coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-art">
        <Link className="brand auth-brand" href="/"><img src="/logo.svg" alt="" width="40" height="40" />Horti<span className="brand-highlight">Kita</span></Link>
        <div><span className="auth-leaf" aria-hidden="true">✿</span><p className="eyebrow">Ruang tumbuh milik kita</p><h1>Yang baik tumbuh <span>bersama.</span></h1><p>Bagikan proses, temukan teman seperjalanan, dan dukung karya dari komunitas pertanian.</p></div>
        <span className="auth-art-caption">Mulai dari satu benih.</span>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-card">
          <p className="eyebrow">Buat akun baru</p><h2>Gabung HortiKita</h2><p className="muted">Akun baru mendapatkan akses anggota standar.</p>
          {!configured && <div className="notice-box notice-warning" role="status">Firebase belum dikonfigurasi. Isi variabel di <code>.env.local</code> untuk mengaktifkan pendaftaran.</div>}
          {error && <div className="notice-box notice-error" role="alert">{error}</div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>Nama lengkap<input autoComplete="name" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama kamu" /></label>
            <label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" /></label>
            <label>Angkatan<select required value={cohort} onChange={(event) => setCohort(event.target.value)}><option value="">Pilih angkatan</option><option value="angkatan-24">Angkatan 24</option><option value="angkatan-25">Angkatan 25</option><option value="angkatan-26">Angkatan 26</option><option value="angkatan-27">Angkatan 27</option></select></label>
            <label>Kata sandi<input type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 6 karakter" /></label>
            <button className="button auth-submit" disabled={!configured || busy}>{busy ? "Membuat akun..." : "Buat akun"}</button>
          </form>
          <p className="auth-switch">Sudah punya akun? <Link href="/login">Masuk</Link></p>
        </div>
      </div>
    </section>
  );
}
