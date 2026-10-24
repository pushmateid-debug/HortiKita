import type { Metadata } from "next";
import { DemoBadge } from "@/components/layout/site-shell";
import { events } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Acara" };

export default function EventsPage() {
  return <section className="page-content inner-page">
    <div className="page-intro"><p className="eyebrow">Belajar dan bertemu</p><h1>Agenda yang <span>menyatukan.</span></h1><p>Kegiatan, kelas, dan cerita lapangan dari komunitas pertanian.</p></div>
    <div className="catalog-heading"><h2>Acara mendatang</h2><DemoBadge>Contoh agenda</DemoBadge></div>
    <div className="event-grid event-grid-page">{events.map((event) => <article className="event-card" key={event.title}>
      <img src={event.image} alt="" loading="lazy" /><div className="event-date"><strong>{event.day}</strong><span>{event.month}</span></div>
      <div className="event-card-content"><p>{event.location}</p><h3>{event.title}</h3><span>{event.description}</span><span className="event-rsvp-note">Informasi pendaftaran belum tersedia.</span></div>
    </article>)}</div>
    <p className="demo-note"><DemoBadge /> Jadwal ini adalah contoh; belum ada acara produksi yang dipublikasikan.</p>
  </section>;
}
