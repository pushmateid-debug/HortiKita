import type { Metadata } from "next";
import { DemoBadge } from "@/components/layout/site-shell";
import { ProductCatalog } from "@/components/marketplace/product-catalog";

export const metadata: Metadata = { title: "Marketplace" };

export default function MarketplacePage() {
  return (
    <section className="page-content inner-page">
      <div className="page-intro marketplace-intro">
        <p className="eyebrow">Dari komunitas, untuk komunitas</p>
        <h1>Temukan yang <span>tumbuh di sini.</span></h1>
        <p>Hasil kebun, bibit, makanan olahan, dan karya dari teman-teman HortiKita.</p>
      </div>
      <div className="catalog-heading"><h2>Jelajahi produk</h2><DemoBadge>Contoh katalog</DemoBadge></div>
      <ProductCatalog />
    </section>
  );
}
