import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Ganti dari Geist ke Inter
import "./globals.css";

const inter = Inter({ subsets: ["latin"] }); // Inisialisasi Inter

export const metadata: Metadata = {
  title: "WebGIS UHI Tabanan",
  description: "Analisis Urban Heat Island Kabupaten Tabanan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}> {/* Gunakan inter.className */}
        {children}
      </body>
    </html>
  );
}