import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoBadge } from "@/components/layout/site-shell";
import { formatRupiah, products } from "@/lib/demo-data";

type Props = { params: Promise<{ productId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const product = products.find((item) => item.id === productId);
  return { title: product?.name ?? "Produk tidak ditemukan" };
}

export default async function ProductDetailPage({ params }: Props) {
  const { productId } = await params;
  const product = products.find((item) => item.id === productId);
  if (!product) notFound();

  return (
    <section className="page-content inner-page product-detail-page">
      <Link className="back-link" href="/marketplace">← Kembali ke toko</Link>
      <div className="product-detail">
        <div className="detail-photo-wrap"><img className="detail-photo" src={product.image.replace("w=700", "w=1100")} alt={product.name} /><span className={`availability detail-availability ${product.status === "Ready" ? "is-ready" : "is-preorder"}`}>{product.status}</span></div>
        <div className="detail-info">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <strong className="detail-price">{formatRupiah(product.price)}</strong>
          <p className="detail-description">{product.description}</p>
          <dl className="product-facts">
            <div><dt>Penjual</dt><dd>{product.seller}</dd></div>
            <div><dt>Ketersediaan</dt><dd>{product.status}</dd></div>
            <div><dt>Stok demo</dt><dd>{product.stock} unit</dd></div>
          </dl>
          <div className="trace-card"><p className="eyebrow">Asal produk</p><p>{product.origin}</p></div>
          <DemoBadge>Produk demonstrasi</DemoBadge>
          <button type="button" className="button order-button" disabled aria-describedby="contact-note">Pesan via WhatsApp <span aria-hidden="true">↗</span></button>
          <p id="contact-note" className="contact-note">Kontak penjual belum tersedia. Kami tidak mencantumkan nomor WhatsApp contoh sebagai kontak nyata.</p>
        </div>
      </div>
    </section>
  );
}
