import Link from "next/link";
import { DemoBadge } from "@/components/layout/site-shell";
import { ProductCard } from "@/components/marketplace/product-card";
import { cohorts, demoNotice, events, products, projects } from "@/lib/demo-data";

export default function HomePage() {
  return (
    <div className="page-content">
      <section className="home-hero">
        <div className="hero-copy-block">
          <p className="eyebrow"><span className="eyebrow-dot" /> Komunitas pertanian yang saling menumbuhkan</p>
          <h1>Tumbuh bareng <span>angkatanmu.</span></h1>
          <p className="hero-description">Tempat berbagi cerita, menunjukkan karya, dan menemukan produk dari komunitas pertanian.</p>
          <div className="hero-actions">
            <Link href="/community" className="button">Jelajahi Angkatan <span aria-hidden="true">→</span></Link>
            <Link href="/marketplace" className="button button-outline">Lihat Toko</Link>
          </div>
          <p className="hero-caption"><span className="avatar-stack"><i>A</i><i>B</i><i>C</i></span> Cerita dan karya komunitas PTH Jember</p>
        </div>
        <div className="hero-image-wrap">
          <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85" alt="Lahan hijau tempat sayuran tumbuh subur" />
          <div className="hero-image-note"><span className="note-icon">✳</span><span><strong>Berakar di Jember</strong><small>Bertumbuh bersama PTH</small></span></div>
          <span className="hero-sun" aria-hidden="true">✳</span>
        </div>
      </section>

      <section className="content-section" aria-labelledby="cohorts-heading">
        <div className="section-heading">
          <div><p className="eyebrow">Teman seperjalanan</p><h2 id="cohorts-heading">Angkatan kami</h2><p>Kenalan, berbagi cerita, dan tumbuh bareng.</p><span className="demo-badge">PROFIL CONTOH</span></div>
          <Link className="text-link section-link" href="/community">Lihat semua angkatan <span>→</span></Link>
        </div>
        <div className="cohort-strip">
          {cohorts.map((cohort) => (
            <Link href={`/community/${cohort.slug}`} className="cohort-card" key={cohort.slug}>
              <img src={cohort.image} alt={`Kebun komunitas ${cohort.name}`} loading="lazy" />
              <span className="cohort-year">{cohort.name.replace("Angkatan ", "")}</span>
              <span className="cohort-card-body"><strong>{cohort.name}</strong><small>{cohort.tagline}</small></span>
            </Link>
          ))}
        </div>
        <p className="demo-note"><DemoBadge /> Jumlah anggota di profil angkatan adalah contoh untuk pratinjau.</p>
      </section>

      <section className="content-section harvest-section" aria-labelledby="harvest-heading">
        <div className="section-heading">
          <div><p className="eyebrow">Dari kebun ke meja</p><h2 id="harvest-heading">Baru panen</h2><p>Hasil kebun dan karya komunitas.</p></div>
          <Link className="text-link section-link" href="/marketplace">Jelajahi toko <span>→</span></Link>
        </div>
        <p className="catalog-demo-label"><DemoBadge /> Katalog contoh</p>
        <div className="product-grid home-product-grid">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section className="content-section events-section" aria-labelledby="events-heading">
        <div className="section-heading">
          <div><p className="eyebrow">Simpan tanggalnya</p><h2 id="events-heading">Acara mendatang</h2><span className="demo-badge">AGENDA CONTOH</span></div>
          <Link className="text-link section-link" href="/events">Semua acara <span>→</span></Link>
        </div>
        <div className="event-grid">
          {events.map((event) => <article className="event-card" key={event.title}>
            <img src={event.image} alt="" loading="lazy" />
            <div className="event-date"><strong>{event.day}</strong><span>{event.month}</span></div>
            <div className="event-card-content"><p>{event.location}</p><h3>{event.title}</h3><span>{event.description}</span></div>
          </article>)}
        </div>
      </section>

      <section className="content-section project-section" aria-labelledby="projects-heading">
        <div className="section-heading"><div><p className="eyebrow">Belajar lewat praktik</p><h2 id="projects-heading">Cerita PBL terbaru</h2><span className="demo-badge">PROYEK CONTOH</span></div></div>
        <div className="project-grid">{projects.map((project) => <article className="project-card" key={project.title}>
          <img src={project.image} alt={project.title} loading="lazy" />
          <div><span className="eyebrow">{project.cohort}</span><h3>{project.title}</h3><p>{project.description}</p></div>
        </article>)}</div>
        <p className="demo-note"><DemoBadge /> {demoNotice}</p>
      </section>
    </div>
  );
}
