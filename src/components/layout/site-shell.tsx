import Link from "next/link";

const navItems = [
  { href: "/", label: "Beranda", path: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" },
  { href: "/community", label: "Angkatan", path: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { href: "/marketplace", label: "Toko", path: "M3 8h18l-1.5 13h-15zM5 8l2-5h10l2 5M9 12v2m6-2v2" },
  { href: "/events", label: "Acara", path: "M4 5h16v16H4zM8 3v4m8-4v4M4 10h16" },
  { href: "/login", label: "Profil", path: "M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="HortiKita, kembali ke beranda">
        <img src="/logo.svg" alt="" width="38" height="38" />
        <span>Horti<span className="brand-highlight">Kita</span></span>
      </Link>
      <nav className="desktop-nav" aria-label="Navigasi utama">
        {navItems.slice(0, 4).map(({ href, label }) => (
          <Link href={href} key={href}>{label}</Link>
        ))}
      </nav>
      <div className="header-actions">
        <Link href="/login">Masuk</Link>
        <Link className="button button-small" href="/register">Gabung sekarang</Link>
      </div>
    </header>
  );
}

export function MobileNavigation() {
  return (
    <nav className="mobile-nav" aria-label="Navigasi mobile">
      {navItems.map(({ href, label }, index) => (
        <Link href={href} key={href} aria-label={label}>
          <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={navItems[index].path} /></svg>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Link className="brand" href="/"><img src="/logo.svg" alt="" width="34" height="34" />Horti<span className="brand-highlight">Kita</span></Link>
        <p>Tempat berbagi cerita, karya, dan hasil pertanian komunitas.</p>
      </div>
      <div className="footer-links">
        <Link href="/community">Angkatan</Link>
        <Link href="/marketplace">Marketplace</Link>
        <Link href="/organizations">Organisasi</Link>
        <Link href="/events">Acara</Link>
      </div>
      <p className="footer-note">Bertumbuh bersama komunitas PTH.</p>
    </footer>
  );
}

export function DemoBadge({ children = "DEMO" }: { children?: React.ReactNode }) {
  return <span className="demo-badge">{children}</span>;
}
