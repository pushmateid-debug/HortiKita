import type { Metadata } from "next";
import Link from "next/link";
import { DemoBadge } from "@/components/layout/site-shell";
import { cohorts } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Komunitas Angkatan" };

export default function CommunityPage() {
  return (
    <section className="page-content inner-page">
      <div className="page-intro"><p className="eyebrow">Teman seperjalananmu</p><h1>Tumbuh bersama <span>angkatan.</span></h1><p>Kenalan dengan komunitas dan cerita teman-teman Produksi Tanaman Hortikultura.</p></div>
      <div className="catalog-heading"><h2>Komunitas PTH</h2><DemoBadge>Profil demonstrasi</DemoBadge></div>
      <div className="community-grid">{cohorts.map((cohort) => <Link className="community-card" href={`/community/${cohort.slug}`} key={cohort.slug}>
        <img src={cohort.image} alt={`Kebun ${cohort.name}`} loading="lazy" /><div className="community-card-copy"><span className="eyebrow">{cohort.location}</span><h3>{cohort.name}</h3><p>{cohort.tagline}</p><span>{cohort.members} anggota · contoh <b>→</b></span></div>
      </Link>)}</div>
    </section>
  );
}
