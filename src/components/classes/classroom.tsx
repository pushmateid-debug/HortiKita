"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  type DocumentData,
} from "firebase/firestore";
import { DemoBadge } from "@/components/layout/site-shell";
import { useAuth } from "@/components/layout/auth-provider";
import { firestore } from "@/lib/firebase/firestore";

const tabs = ["Pengumuman", "Kas", "Aturan Kelas", "Jadwal Piket", "Dokumen"] as const;
type Tab = (typeof tabs)[number];
type Transaction = { id: string; date: string; description: string; income: number; expense: number };
type ClassRecord = { name?: string; memberIds?: string[]; adminIds?: string[] };
type ClassItem = { id: string } & DocumentData;

const demoTransactions: Transaction[] = [
  { id: "demo-1", date: "2026-10-02", description: "Iuran kelas (contoh)", income: 200000, expense: 0 },
  { id: "demo-2", date: "2026-10-04", description: "Perlengkapan kebun (contoh)", income: 0, expense: 75000 },
  { id: "demo-3", date: "2026-10-06", description: "Kas kegiatan (contoh)", income: 150000, expense: 0 },
];
const demoAnnouncements = [
  { title: "Jadwal praktikum kebun", body: "Berkumpul di kebun praktik sesuai jadwal kelas. Bawa alat tulis dan botol minum sendiri.", author: "Pengurus kelas (contoh)", date: "5 November 2026", important: true },
  { title: "Pengingat iuran kas", body: "Catatan iuran bulan ini tersedia untuk ditinjau oleh anggota kelas.", author: "Pengurus kelas (contoh)", date: "3 November 2026", important: false },
];
const demoRules = ["Jaga kebersihan ruang bersama dan kebun praktik.", "Saling menghargai saat diskusi dan kegiatan kelompok.", "Kembalikan alat praktik setelah digunakan.", "Pastikan informasi kegiatan dibagikan melalui kanal resmi kelas."];
const demoSchedule = [
  ["Senin", "Alya, Bima", "Kebun A"],
  ["Selasa", "Citra, Dimas", "Kebun B"],
  ["Rabu", "Alya, Citra", "Greenhouse"],
  ["Kamis", "Bima, Dimas", "Kebun A"],
  ["Jumat", "Semua anggota", "Area bersama"],
];

function money(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export function Classroom({ classId }: { classId: string }) {
  const { user, loading: authLoading, configured } = useAuth();
  const [tab, setTab] = useState<Tab>("Pengumuman");
  const [classInfo, setClassInfo] = useState<ClassRecord | null>(null);
  const [announcements, setAnnouncements] = useState<ClassItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rules, setRules] = useState<ClassItem[]>([]);
  const [schedules, setSchedules] = useState<ClassItem[]>([]);
  const [documents, setDocuments] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoAdminPreview, setDemoAdminPreview] = useState(false);

  useEffect(() => {
    if (!configured || authLoading || !user || !firestore) return;
    let active = true;
    async function loadClass() {
      setLoading(true);
      setError("");
      try {
        const classRef = doc(firestore!, "classes", classId);
        const snapshot = await getDoc(classRef);
        if (!snapshot.exists()) {
          if (active) setError("Ruang kelas belum tersedia di Firestore.");
          return;
        }
        const info = snapshot.data() as ClassRecord;
        if (active) setClassInfo(info);
        const fetchList = async (name: string): Promise<ClassItem[]> => {
          const result = await getDocs(query(collection(classRef, name), orderBy("createdAt", "desc"), limit(20)));
          return result.docs.map((item): ClassItem => ({ id: item.id, ...item.data() }));
        };
        const [postItems, transactionsItems, rulesItems, scheduleItems, documentItems] = await Promise.all([
          fetchList("announcements"),
          fetchList("transactions"),
          fetchList("rules"),
          fetchList("schedules"),
          fetchList("documents"),
        ]);
        if (!active) return;
        setAnnouncements(postItems);
        setTransactions(transactionsItems.map((item) => ({
          id: item.id,
          date: typeof item.date === "string" ? item.date : "",
          description: typeof item.description === "string" ? item.description : "",
          income: typeof item.income === "number" ? item.income : 0,
          expense: typeof item.expense === "number" ? item.expense : 0,
        })));
        setRules(rulesItems);
        setSchedules(scheduleItems);
        setDocuments(documentItems);
      } catch {
        if (active) setError("Data ruang kelas tidak dapat dimuat. Akses ditolak atau koneksi bermasalah.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadClass();
    return () => { active = false; };
  }, [authLoading, classId, configured, user]);

  const previewBalance = useMemo(() => demoTransactions.reduce((balance, item) => balance + item.income - item.expense, 0), []);
  const actualBalance = useMemo(() => transactions.reduce((balance, item) => balance + item.income - item.expense, 0), [transactions]);
  const currentMonth = new Intl.DateTimeFormat("sv-SE", { year: "numeric", month: "2-digit" }).format(new Date()).slice(0, 7);
  const monthlyTransactions = transactions.filter((item) => item.date.startsWith(currentMonth));
  const monthIncome = monthlyTransactions.reduce((total, item) => total + item.income, 0);
  const monthExpense = monthlyTransactions.reduce((total, item) => total + item.expense, 0);
  const isDemo = !configured;
  const isAdmin = !isDemo && Boolean(user && (classInfo?.adminIds?.includes(user.uid)));
  const pageTitle = isDemo ? "Angkatan 26" : classInfo?.name ?? classId;

  if (configured && authLoading) return <div className="loading-state" role="status">Memeriksa sesi anggota...</div>;
  if (configured && !user) return <div className="access-card"><span className="access-icon">⌑</span><p className="eyebrow">Ruang privat</p><h1>Masuk untuk melanjutkan</h1><p>Ruang kelas hanya tersedia setelah akunmu terautentikasi dan terdaftar sebagai anggota oleh pengelola.</p><Link className="button" href="/login">Masuk</Link></div>;
  if (configured && error) return <div className="access-card"><span className="access-icon">⌑</span><p className="eyebrow">Akses terbatas</p><h1>Ruang kelas tidak dapat dibuka</h1><p role="alert">{error}</p><p>Keanggotaan dan peran diperiksa oleh Firebase Security Rules; simulasi browser tidak dapat melewati pemeriksaan ini.</p><Link className="button button-outline" href="/">Kembali ke beranda</Link></div>;
  if (configured && loading) return <div className="loading-state" role="status">Memuat ruang privat yang diizinkan...</div>;

  const displayedTransactions = [...(isDemo ? demoTransactions : transactions)].sort((left, right) => left.date.localeCompare(right.date));
  const displayedBalance = isDemo ? previewBalance : actualBalance;
  const displayedIncome = isDemo ? demoTransactions.reduce((sum, item) => sum + item.income, 0) : monthIncome;
  const displayedExpense = isDemo ? demoTransactions.reduce((sum, item) => sum + item.expense, 0) : monthExpense;

  return <section className="classroom-page">
    <div className="classroom-banner"><span className="class-lock" aria-hidden="true">⌑</span><div><span className="eyebrow">RUANG PRIVAT</span><h1>Ruang privat {pageTitle}</h1><p>{isDemo ? "Mode pratinjau — contoh di halaman ini bukan data kelas yang sebenarnya." : "Akses anggota diverifikasi menggunakan aturan keamanan Firestore."}</p></div></div>
    <div className="classroom-meta"><div><p className="eyebrow">RUANG KELAS</p><h2>{pageTitle}</h2></div>
      {isDemo ? <label className="demo-role-switch"><input type="checkbox" checked={demoAdminPreview} onChange={(event) => setDemoAdminPreview(event.target.checked)} /> Pratinjau tampilan admin <DemoBadge>SIMULASI</DemoBadge></label> : isAdmin && <span className="verified-role">Admin terverifikasi</span>}
    </div>
    {isDemo && demoAdminPreview && <div className="notice-box notice-warning">Pratinjau admin hanya mengubah tampilan lokal. Tindakan tulis tetap nonaktif dan mode ini tidak memberikan izin produksi.</div>}
    <div className="tabs classroom-tabs" role="tablist" aria-label="Menu ruang kelas">{tabs.map((item) => <button role="tab" aria-selected={tab === item} aria-controls="classroom-panel" className={`tab-button ${tab === item ? "is-active" : ""}`} key={item} onClick={() => setTab(item)}>{item}</button>)}</div>
    <div className="classroom-panel" id="classroom-panel" role="tabpanel">
      {tab === "Pengumuman" && <section className="class-list-panel"><div className="panel-heading"><div><h2>Pengumuman</h2><p>Informasi untuk anggota ruang kelas.</p></div>{isAdmin && <button className="button button-small" disabled title="Form pengumuman belum terhubung.">＋ Tambah</button>}{isDemo && demoAdminPreview && <button className="button button-small" disabled title="Aksi demo tidak menulis data.">＋ Tambah · demo</button>}</div>
        {isDemo ? demoAnnouncements.map((item) => <article className="announcement-card" key={item.title}><div className="announcement-top"><span className={item.important ? "important-tag" : "eyebrow"}>{item.important ? "PENTING · CONTOH" : "PENGUMUMAN"}</span><time>{item.date}</time></div><h3>{item.title}</h3><p>{item.body}</p><small>{item.author}</small></article>) : announcements.length ? announcements.map((item) => <article className="announcement-card" key={item.id}><div className="announcement-top"><span>{item.important === true ? "PENTING" : "PENGUMUMAN"}</span><time>{typeof item.date === "string" ? item.date : "Tanggal tidak tersedia"}</time></div><h3>{String(item.title ?? "Pengumuman kelas")}</h3><p>{String(item.body ?? "")}</p><small>{String(item.authorName ?? "Pengurus kelas")}</small></article>) : <div className="empty-state">Belum ada pengumuman untuk ditampilkan.</div>}</section>}
      {tab === "Kas" && <section className="class-list-panel"><div className="panel-heading"><div><h2>Kas kelas</h2><p>Catatan masuk dan keluar berdasarkan transaksi.</p></div><DemoBadge>{isDemo ? "DATA DEMO" : "FIRESTORE"}</DemoBadge></div>
        <div className="finance-note">Halaman ini hanya pencatatan, bukan tempat penyimpanan uang.</div>
        <div className="finance-cards"><article><span>Saldo transaksi dimuat</span><strong>{money(displayedBalance)}</strong></article><article><span>Pemasukan bulan ini</span><strong>{money(isDemo ? demoTransactions.reduce((sum, item) => sum + item.income, 0) : displayedIncome)}</strong></article><article><span>Pengeluaran bulan ini</span><strong>{money(isDemo ? demoTransactions.reduce((sum, item) => sum + item.expense, 0) : displayedExpense)}</strong></article></div>
        {!isDemo && <p className="finance-footnote">Ringkasan saldo berasal dari maksimal 20 transaksi terbaru yang dimuat pada halaman ini.</p>}
        <div className="transaction-scroll"><table className="transaction-table"><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Uang masuk</th><th>Uang keluar</th><th>Saldo</th></tr></thead><tbody>{displayedTransactions.reduce<{ rows: React.ReactNode[]; balance: number }>((state, transaction) => {
          const balance = state.balance + transaction.income - transaction.expense;
          state.rows.push(<tr key={transaction.id}><td>{transaction.date}</td><td>{transaction.description}</td><td>{transaction.income ? money(transaction.income) : "—"}</td><td>{transaction.expense ? money(transaction.expense) : "—"}</td><td>{money(balance)}</td></tr>);
          state.balance = balance;
          return state;
        }, { rows: [], balance: 0 }).rows}</tbody></table></div>
        {isAdmin && <button className="button button-small" disabled title="Input transaksi belum tersedia.">＋ Tambah transaksi</button>}
      </section>}
      {tab === "Aturan Kelas" && <section className="class-list-panel"><div className="panel-heading"><div><h2>Aturan kelas</h2><p>Disepakati untuk menjaga ruang belajar bersama.</p></div></div><ol className="rules-list">{(isDemo ? demoRules : rules.map((item) => String(item.text ?? ""))).filter(Boolean).map((rule, index) => <li key={`${rule}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{rule}</li>)}</ol>{!isDemo && !rules.length && <div className="empty-state">Belum ada aturan kelas.</div>}</section>}
      {tab === "Jadwal Piket" && <section className="class-list-panel"><div className="panel-heading"><div><h2>Jadwal piket</h2><p>Pembagian tugas mingguan. Jadwal pratinjau adalah contoh.</p></div></div><div className="schedule-list">{(isDemo ? demoSchedule.map(([day, team, place]) => ({ day, team, place })) : schedules.map((item) => ({ day: String(item.day ?? ""), team: String(item.team ?? ""), place: String(item.location ?? "") }))).map((item) => <div className="schedule-row" key={`${item.day}-${item.place}`}><strong>{item.day}</strong><span>{item.team}</span><small>{item.place}</small></div>)}</div>{!isDemo && !schedules.length && <div className="empty-state">Belum ada jadwal piket.</div>}</section>}
      {tab === "Dokumen" && <section className="class-list-panel"><div className="panel-heading"><div><h2>Dokumen kelas</h2><p>Hanya anggota terverifikasi yang bisa melihat tautan.</p></div></div>{isDemo ? <div className="empty-state"><span>Belum ada file contoh yang tersedia untuk diunduh.</span><small>Tautan dokumen tidak dibuat-buat.</small></div> : documents.length ? documents.map((item) => <article className="document-row" key={item.id}><span className="document-icon">▤</span><span><strong>{String(item.name ?? "Dokumen kelas")}</strong><small>{String(item.fileType ?? "File")}</small></span>{typeof item.url === "string" && item.url.startsWith("https://") ? <a href={item.url} target="_blank" rel="noreferrer">Buka ↗</a> : <span className="muted">File belum tersedia</span>}</article>) : <div className="empty-state">Belum ada dokumen untuk ditampilkan.</div>}</section>}
    </div>
    <p className="demo-note">{isDemo ? <><DemoBadge /> Pratinjau ini tidak terhubung ke database privat.</> : "Data diambil melalui sesi pengguna yang terautentikasi; Firestore Security Rules memverifikasi akses kelas."}</p>
  </section>;
}
