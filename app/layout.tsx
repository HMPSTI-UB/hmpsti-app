import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hmpstiub.vercel.app"),
  title: "HMPSTI UB | KABINET INNOVARA",
  description: "Website Kabinet Innovara HMPSTI UB.",
  openGraph: {
    title: "HMPSTI UB | KABINET INNOVARA",
    description: "Website Kabinet Innovara HMPSTI UB.",
    url: "https://hmpstiub.vercel.app",
    siteName: "HMPSTI UB",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-dark text-white">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
