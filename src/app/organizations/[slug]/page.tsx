import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const organizations = {
  "himpunan-pth": { name: "Himpunan Mahasiswa PTH", short: "HMP", about: "Himpunan mahasiswa menjadi ruang belajar, berjejaring, dan mengembangkan kepedulian terhadap pertanian.", color: "green" },
  "bem-pth": { name: "BEM PTH", short: "BEM", about: "Kegiatan dan kabar organisasi mahasiswa untuk mendukung komunitas Produksi Tanaman Hortikultura.", color: "orange" },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const organization = organizations[slug as keyof typeof organizations];
  return { title: organization?.name ?? "Organisasi tidak ditemukan" };
}

export default async function OrganizationPage({ params }: Props) {
  const { slug } = await params;
  const organization = organizations[slug as keyof typeof organizations];
  if (!organization) notFound();
  return <section className="page-content inner-page organization-detail">
    <Link className="back-link" href="/organizations">← Semua organisasi</Link>
    <div className="organization-hero"><span className={`organization-mark ${organization.color}`}>{organization.short}</span><p className="eyebrow">Organisasi mahasiswa · profil contoh</p><h1>{organization.name}</h1><p>{organization.about}</p></div>
    <div className="notice-box notice-warning"><strong>Informasi demonstrasi.</strong> Profil ini belum dikelola oleh akun organisasi resmi.</div>
    <Link href="/events" className="text-link">Jelajahi kegiatan komunitas →</Link>
  </section>;
}
