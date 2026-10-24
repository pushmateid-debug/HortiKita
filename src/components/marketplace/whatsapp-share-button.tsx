"use client";

import { formatRupiah } from "@/lib/demo-data";

type Props = {
  productId: string;
  productName: string;
  price: number;
  className?: string;
};

export function WhatsAppShareButton({ productId, productName, price, className = "button button-outline" }: Props) {
  function shareProduct() {
    const productUrl = new URL(`/marketplace/${encodeURIComponent(productId)}`, window.location.origin).toString();
    const message = `Lihat ${productName} — ${formatRupiah(price)} di HortiKita: ${productUrl}`;
    const whatsappUrl = new URL("https://wa.me/");
    whatsappUrl.searchParams.set("text", message);
    window.open(whatsappUrl.toString(), "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      className={className}
      onClick={shareProduct}
      aria-label={`Bagikan ${productName} ke WhatsApp`}
    >
      <span aria-hidden="true">↗</span> Bagikan
    </button>
  );
}
