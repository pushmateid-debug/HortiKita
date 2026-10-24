import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Organisasi" };

const organizations = [
  { slug: "himpunan-pth", name: "Himpunan Mahasiswa PTH", short: "HMP", summary: "Ruang kolaborasi dan kegiatan mahasiswa Produksi Tanaman Hortikultura.", color: "green" },
  { slug: "bem-pth", name: "BEM PTH", short: "BEM", summary: "Inisiatif mahasiswa, informasi kegiatan, dan karya organisasi.", color: "orange" },
];

export default function OrganizationsPage() {
  return <section className="page-content inner-page">
    <div className="page-intro"><p className="eyebrow">Bergerak bersama</p><h1>Organisasi yang <span>menumbuhkan.</span></h1><p>Temukan informasi kegiatan dan karya organisasi mahasiswa.</p></div>
    <div className="catalog-heading"><h2>Kenalan dengan organisasi</h2><span className="demo-badge">CONTOH PROFIL</span></div>
    <div className="organization-grid">{organizations.map((organization) => <Link className="organization-card" href={`/organizations/${organization.slug}`} key={organization.slug}>
      <span className={`organization-mark ${organization.color}`}>{organization.short}</span><span className="eyebrow">Komunitas PTH · Jember</span><h3>{organization.name}</h3><p>{organization.summary}</p><span className="text-link">Lihat profil <b>→</b></span>
    </Link>)}</div>
    <p className="demo-note"><span className="demo-badge">DEMO</span> Profil organisasi belum terhubung ke pengurus resmi.</p>
  </section>;
}
