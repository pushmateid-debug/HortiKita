"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DemoBadge } from "@/components/layout/site-shell";
import { useAuth } from "@/components/layout/auth-provider";
import { MediaUploader } from "@/components/dashboard/media-uploader";

const metrics = [
  { label: "Kunjungan minggu ini", value: "128", note: "contoh kunjungan", icon: "↗" },
  { label: "Pesanan masuk", value: "8", note: "contoh pesanan", icon: "▤" },
  { label: "Produk aktif", value: "12", note: "contoh produk", icon: "◇" },
  { label: "Anggota", value: "42", note: "contoh anggota", icon: "◉" },
];
const chartValues = [
  { day: "Sen", value: 30 },
  { day: "Sel", value: 48 },
  { day: "Rab", value: 36 },
  { day: "Kam", value: 70 },
  { day: "Jum", value: 52 },
  { day: "Sab", value: 86 },
  { day: "Min", value: 61 },
];
const demoOrders = [
  { id: "HK-2401", product: "Selada hidroponik", status: "Baru" },
  { id: "HK-2402", product: "Bibit tomat cherry", status: "Diproses" },
  { id: "HK-2403", product: "Paket sayur panen", status: "Selesai" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading, configured, error } = useAuth();
  const admin = profile?.role === "cohortAdmin" || profile?.role === "platformAdmin";

  useEffect(() => {
    if (!loading && configured && !user) router.replace("/login");
  }, [loading, configured, user, router]);

  if (!configured) return <section className="page-content inner-page"><div className="access-card"><span className="access-icon">⌑</span><p className="eyebrow">Area pengurus</p><h1>Dashboard belum tersedia</h1><p>Konfigurasikan Firebase dan tetapkan peran admin melalui proses tepercaya sebelum dashboard dibuka.</p><Link className="button" href="/login">Masuk</Link></div></section>;
  if (loading) return <section className="page-content inner-page"><div className="loading-state" role="status">Memeriksa sesi dan izin akun...</div></section>;
  if (!user) return <section className="page-content inner-page"><div className="loading-state">Mengalihkan ke halaman masuk...</div></section>;
  if (error) return <section className="page-content inner-page"><div className="notice-box notice-error" role="alert">{error}</div></section>;
  if (!admin) return <section className="page-content inner-page"><div className="access-card"><span className="access-icon">⌑</span><p className="eyebrow">Area terbatas</p><h1>Akses pengurus diperlukan</h1><p>Peran dashboard ditetapkan melalui Firebase oleh pengelola yang berwenang. Akun anggota tidak dapat mengaktifkan akses admin dari browser.</p><Link className="button button-outline" href="/">Kembali ke beranda</Link></div></section>;

  const cohortName = profile?.cohortId?.replace("angkatan-", "Angkatan ") ?? "Platform";
  return <section className="page-content inner-page dashboard-page">
    <div className="dashboard-welcome"><div><p className="eyebrow">Ruang pengelolaan</p><h1>Halo, Admin {cohortName}</h1><p>Kelola ruang komunitasmu dengan tenang dan bertahap.</p></div><DemoBadge>SEMUA ANGKA = DATA DEMONSTRASI</DemoBadge></div>
    <div className="notice-box notice-warning">Statistik dan pesanan di bawah adalah contoh antarmuka, bukan data produksi. Integrasi Firestore untuk analitik dan pesanan belum tersedia.</div>
    <div className="dashboard-metrics">{metrics.map((metric) => <article className="metric-card" key={metric.label}><span className="metric-icon" aria-hidden="true">{metric.icon}</span><span>{metric.label}</span><strong>{metric.value}</strong><small><DemoBadge>DEMO</DemoBadge> {metric.note}</small></article>)}</div>
    <div className="dashboard-columns"><section className="dashboard-panel"><div className="panel-heading"><h2>Aksi cepat</h2><span className="muted">Integrasi data belum aktif</span></div><div className="quick-actions">
      <button disabled title="Pengelolaan produk memerlukan koleksi Firestore.">＋ Tambah produk <small>Belum tersedia</small></button>
      <Link href="#media-uploader">↑ Unggah foto <small>Pilih gambar atau video</small></Link>
      <button disabled title="Pengumuman memerlukan skema Firestore dan izin kelas.">▤ Buat pengumuman <small>Belum tersedia</small></button>
      <Link href="/events">◇ Lihat acara <small>Buka agenda komunitas</small></Link>
    </div></section><section className="dashboard-panel"><div className="panel-heading"><div><h2>Pesanan terbaru</h2><small><DemoBadge>CONTOH</DemoBadge></small></div><Link href="/marketplace">Lihat katalog →</Link></div><div className="order-list">{demoOrders.map((order) => <div className="order-row" key={order.id}><span className="order-mark">▤</span><span className="order-main"><strong>{order.product}</strong><small>{order.id} · data contoh</small></span><span className={`order-status status-${order.status.toLocaleLowerCase("id")}`}>{order.status}</span></div>)}</div></section></div>
    <section className="dashboard-panel dashboard-chart-panel"><div className="panel-heading"><div><h2>Kunjungan selama 7 hari</h2><p>Grafik ilustrasi untuk pratinjau UI.</p></div><DemoBadge>DATA DEMO</DemoBadge></div><div className="chart-bars" role="img" aria-label="Grafik demonstrasi kunjungan 7 hari, bukan data produksi">{chartValues.map((item) => <div className="chart-column" key={item.day}><span className="chart-bar" style={{ height: `${item.value}%` }} /><small>{item.day}</small></div>)}</div></section>
    <div id="media-uploader" className="dashboard-upload"><MediaUploader /></div>
    <p className="demo-note">Akses halaman ini dibatasi oleh akun. Otorisasi data tetap ditegakkan oleh Firebase Security Rules.</p>
  </section>;
}
