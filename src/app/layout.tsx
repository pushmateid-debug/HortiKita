import type { Metadata } from "next";
import { AuthProvider } from "@/components/layout/auth-provider";
import { MobileNavigation, SiteFooter, SiteHeader } from "@/components/layout/site-shell";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "HortiKita",
    template: "%s | HortiKita",
  },
  description: "Tempat berbagi cerita, karya, dan hasil pertanian komunitas PTH Jember.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <MobileNavigation />
        </AuthProvider>
      </body>
    </html>
  );
}
