import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import LayoutWrapper from '@/components/LayoutWrapper';

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
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
