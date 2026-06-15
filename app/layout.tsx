import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HMPSTI UB | KABINET INNOVARA",
  description: "Website Kabinet Innovara HMPSTI UB.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-dark text-white">{children}</body>
    </html>
  );
}
