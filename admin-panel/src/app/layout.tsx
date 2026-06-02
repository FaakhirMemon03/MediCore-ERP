import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MYMN SAAB - System Administrator Dashboard",
  description: "MediCore ERP Operations Control Center & Licenses Monitor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
