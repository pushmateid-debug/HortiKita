"use client";

import { useMemo, useState } from "react";
import { products } from "@/lib/demo-data";
import { ProductCard } from "./product-card";

const categories = ["Semua", "Sayur & Buah", "Bibit & Tanaman", "Makanan Olahan", "Merchandise", "Tiket Acara"] as const;
const sellers = ["Semua", "Angkatan 24", "Angkatan 25", "Angkatan 26", "Angkatan 27", "Organisasi"];

export function ProductCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Semua");
  const [seller, setSeller] = useState("Semua");
  const filteredProducts = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("id");
    return products.filter((product) => {
      const matchesQuery = !term || `${product.name} ${product.seller} ${product.category}`.toLocaleLowerCase("id").includes(term);
      const matchesCategory = category === "Semua" || product.category === category;
      const matchesSeller = seller === "Semua" || (seller === "Organisasi" ? product.cohort === "Organisasi" : product.cohort === seller);
      return matchesQuery && matchesCategory && matchesSeller;
    });
  }, [query, category, seller]);

  return (
    <>
      <div className="catalog-controls">
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Cari produk</span>
          <input placeholder="Cari hasil panen, bibit, atau karya..." value={query} onChange={(event) => setQuery(event.target.value)} />
          {query && <button type="button" className="clear-search" onClick={() => setQuery("")} aria-label="Hapus pencarian">×</button>}
        </label>
        <label className="seller-select">
          <span>Penjual</span>
          <select value={seller} onChange={(event) => setSeller(event.target.value)}>
            {sellers.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
      </div>
      <div className="filter-row" aria-label="Filter kategori">
        {categories.map((option) => (
          <button key={option} type="button" onClick={() => setCategory(option)} className={`filter-chip ${category === option ? "is-active" : ""}`} aria-pressed={category === option}>
            {option}
          </button>
        ))}
      </div>
      <p className="result-count" aria-live="polite">{filteredProducts.length} produk ditemukan <span>·</span> Katalog demonstrasi</p>
      {filteredProducts.length ? (
        <div className="product-grid">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      ) : (
        <div className="empty-state"><span>Belum ada produk yang cocok.</span><button className="text-button" onClick={() => { setQuery(""); setCategory("Semua"); setSeller("Semua"); }}>Hapus semua filter</button></div>
      )}
    </>
  );
}
