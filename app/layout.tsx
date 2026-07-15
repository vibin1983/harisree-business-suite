import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Harisree Business Suite",
  description: "Cloud-based multi-shop GST billing application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
