import Link from "next/link";
import type { Product } from "@/lib/demo-data";
import { formatRupiah } from "@/lib/demo-data";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link className="product-image-link" href={`/marketplace/${product.id}`} aria-label={`Lihat ${product.name}`}>
        <img className="product-image" src={product.image} alt={product.name} loading="lazy" />
        <span className={`availability ${product.status === "Ready" ? "is-ready" : "is-preorder"}`}>{product.status}</span>
      </Link>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <Link href={`/marketplace/${product.id}`} className="product-name">{product.name}</Link>
        <strong className="product-price">{formatRupiah(product.price)}</strong>
        <span className="product-seller">{product.seller}</span>
      </div>
    </article>
  );
}
