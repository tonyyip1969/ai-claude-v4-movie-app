import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from '@/components/Sidebar';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Movie App - Discover Amazing Films",
  description: "A modern movie browsing platform with Netflix-inspired design. Browse, search, and watch your favorite movies with an elegant dark theme interface.",
  keywords: ["movies", "films", "entertainment", "streaming", "cinema"],
  authors: [{ name: "Movie App Team" }],
  creator: "Movie App",
  publisher: "Movie App",
  robots: "index, follow",
  openGraph: {
    type: "website",
    title: "Movie App - Discover Amazing Films",
    description: "A modern movie browsing platform with Netflix-inspired design.",
    siteName: "Movie App",
  },
  twitter: {
    card: "summary_large_image",
    title: "Movie App - Discover Amazing Films",
    description: "A modern movie browsing platform with Netflix-inspired design.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <div className="min-h-screen">
          <Sidebar />
          <main className="lg:ml-80">
            <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-12 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
