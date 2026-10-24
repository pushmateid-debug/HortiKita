import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoBadge } from "@/components/layout/site-shell";
import { WhatsAppShareButton } from "@/components/marketplace/whatsapp-share-button";
import { formatRupiah, products } from "@/lib/demo-data";

type Props = { params: Promise<{ productId: string }> };

async function getRequestOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredUrl) {
    const url = new URL(configuredUrl);
    if (url.protocol === "https:" || url.protocol === "http:") return url.origin;
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTP or HTTPS.");
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!host || host.includes(",") || /[/?#@\\\s]/.test(host)) return null;

  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol === "http" || forwardedProtocol === "https"
    ? forwardedProtocol
    : host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https";
  const url = new URL(`${protocol}://${host}`);
  if (!/^(https?:)$/.test(url.protocol) || url.username || url.password || url.pathname !== "/") return null;
  return url.origin;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const product = products.find((item) => item.id === productId);
  if (!product) return { title: "Produk tidak ditemukan" };

  const origin = await getRequestOrigin();
  const productPath = `/marketplace/${encodeURIComponent(product.id)}`;
  const productUrl = origin ? new URL(productPath, origin).toString() : undefined;
  const imageUrl = new URL(product.image);
  imageUrl.searchParams.delete("auto");
  imageUrl.searchParams.set("fm", "jpg");
  imageUrl.searchParams.set("w", "1200");
  imageUrl.searchParams.set("q", "82");
  const description = `${formatRupiah(product.price)}. ${product.description}`;

  return {
    title: product.name,
    description,
    ...(productUrl ? { alternates: { canonical: productUrl } } : {}),
    openGraph: {
      type: "website",
      ...(productUrl ? { url: productUrl } : {}),
      title: product.name,
      description,
      siteName: "HortiKita",
      images: [{ url: imageUrl.toString(), width: 1200, height: 630, alt: product.name }],
    },
  };
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
          <div className="product-detail-actions">
            <WhatsAppShareButton productId={product.id} productName={product.name} price={product.price} />
            <button type="button" className="button order-button" disabled aria-describedby="contact-note">Pesan via WhatsApp <span aria-hidden="true">↗</span></button>
          </div>
          <p id="contact-note" className="contact-note">Kontak penjual belum tersedia. Kami tidak mencantumkan nomor WhatsApp contoh sebagai kontak nyata.</p>
        </div>
      </div>
    </section>
  );
}
