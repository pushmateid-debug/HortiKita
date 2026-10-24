"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DemoBadge } from "@/components/layout/site-shell";
import { ProductCard } from "@/components/marketplace/product-card";
import { cohorts, demoNotice, products, projects } from "@/lib/demo-data";

type Cohort = (typeof cohorts)[number];
type GalleryItem = { src: string; caption: string; videoUrl?: string };
type Props = { cohort: Cohort };

const gallery: GalleryItem[] = [
  { src: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80", caption: "Merapikan bedengan sebelum musim tanam." },
  { src: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80", caption: "Belajar merawat sayuran bareng di kebun." },
  { src: "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=900&q=80", caption: "Lahan praktik yang dirawat bersama." },
  { src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80", caption: "Contoh video bunga di kebun.", videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
  { src: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80", caption: "Mencoba sistem tanam yang lebih hemat ruang." },
  { src: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80", caption: "Tanaman baru di persemaian." },
];

const tabs = ["Galeri", "Produk", "Proyek PBL", "Anggota"] as const;
type Tab = (typeof tabs)[number];

export function CohortProfile({ cohort }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Galeri");
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);
  const [liked, setLiked] = useState(false);
  const cohortProducts = products.filter((product) => product.cohort === cohort.name);
  const cohortProjects = projects.filter((project) => project.cohort.includes(cohort.name));

  useEffect(() => {
    if (!activeImage) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveImage(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [activeImage]);

  return (
    <div className="page-content inner-page cohort-profile-page">
      <section className="cohort-cover">
        <img className="cover-photo" src={cohort.image.replace("w=900", "w=1800")} alt={`Foto kebun ${cohort.name}`} />
        <div className="cover-gradient" />
        <div className="cohort-emblem">{cohort.logo}</div>
      </section>
      <section className="cohort-overview">
        <div className="cohort-overview-copy">
          <p className="eyebrow">Komunitas PTH Jember</p>
          <h1>{cohort.name} <span className="demo-inline">DEMO</span></h1>
          <p>{cohort.bio} <strong>{cohort.tagline}</strong></p>
          <span className="cohort-location">⌖ {cohort.location}</span>
        </div>
        <div className="cohort-actions">
          <a className="button button-outline" href={`https://wa.me/?text=${encodeURIComponent(`Yuk, kenalan dengan ${cohort.name} di HortiKita!`)}`} target="_blank" rel="noreferrer">Bagikan ↗</a>
          <Link className="button" href="/login">Masuk untuk mengikuti</Link>
        </div>
      </section>
      <div className="cohort-stats">
        <div><strong>{cohort.members}</strong><span>anggota <DemoBadge>DEMO</DemoBadge></span></div>
        <div><strong>{cohort.products}</strong><span>produk <DemoBadge>DEMO</DemoBadge></span></div>
        <div><strong>{cohort.projects}</strong><span>proyek PBL <DemoBadge>DEMO</DemoBadge></span></div>
      </div>

      <section className="cohort-content">
        <div className="tabs" role="tablist" aria-label={`Konten ${cohort.name}`}>
          {tabs.map((tab) => (
            <button className={`tab-button ${activeTab === tab ? "is-active" : ""}`} role="tab" id={`tab-${tab}`} aria-selected={activeTab === tab} aria-controls="cohort-tab-panel" key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>
        <div className="tab-panel" id="cohort-tab-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
          {activeTab === "Galeri" && (
            <div className="gallery-grid">
              {gallery.map((item) => <button className="gallery-tile" key={item.src} onClick={() => setActiveImage(item)} aria-label={`Lihat foto: ${item.caption}`}>
                <img src={item.src} alt={item.caption} loading="lazy" />{item.videoUrl && <span className="video-indicator" aria-label="Video">▶</span>}
              </button>)}
            </div>
          )}
          {activeTab === "Produk" && (cohortProducts.length ? <div className="product-grid">{cohortProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state">Belum ada produk contoh untuk angkatan ini.</div>)}
          {activeTab === "Proyek PBL" && (cohortProjects.length ? <div className="project-grid">{cohortProjects.map((project) => <article className="project-card" key={project.title}><img src={project.image} alt={project.title} /><div><span className="eyebrow">{project.cohort}</span><h3>{project.title}</h3><p>{project.description}</p></div></article>)}</div> : <div className="empty-state">Belum ada proyek contoh untuk angkatan ini.</div>)}
          {activeTab === "Anggota" && <div className="member-grid">{["Alya Putri", "Bima Pratama", "Citra Lestari", "Dimas Saputra"].map((name, index) => <div className="member-card" key={name}><span className={`member-avatar member-avatar-${index + 1}`}>{name.split(" ").map((part) => part[0]).join("")}</span><span><strong>{name}</strong><small>Anggota · profil demonstrasi</small></span></div>)}</div>}
        </div>
      </section>

      <section className="latest-stories">
        <div className="section-heading"><div><p className="eyebrow">Catatan dari kebun</p><h2>Cerita terbaru</h2></div><DemoBadge>Contoh cerita</DemoBadge></div>
        <div className="story-grid">{gallery.slice(0, 2).map((item, index) => <article className="story-card" key={item.src}>
          <img src={item.src} alt={item.caption} loading="lazy" />
          <div className="story-content"><span className="story-date">Cerita anggota · Oktober 2026 · contoh</span><p>{item.caption}</p><button className={`like-button ${liked ? "is-liked" : ""}`} onClick={() => setLiked((current) => !current)} aria-pressed={liked}>{liked ? "♥" : "♡"} {12 + index + (liked ? 1 : 0)} suka</button></div>
        </article>)}</div>
      </section>
      <p className="demo-note"><DemoBadge /> {demoNotice}</p>
      {activeImage && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Galeri foto" onClick={() => setActiveImage(null)}>
        <button className="lightbox-close" aria-label="Tutup galeri" onClick={() => setActiveImage(null)}>×</button>
        <figure onClick={(event) => event.stopPropagation()}>{activeImage.videoUrl ? <video src={activeImage.videoUrl} controls autoPlay aria-label={activeImage.caption} /> : <img src={activeImage.src} alt={activeImage.caption} />}<figcaption>{activeImage.caption}</figcaption></figure>
      </div>}
    </div>
  );
}
