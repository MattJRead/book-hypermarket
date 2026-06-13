import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Book Hypermarket",
  description: "The next-generation search engine for independent booksellers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>  
        <meta name='impact-site-verification' content='aa76c5d0-1ed2-4b09-8598-cf44b86a79f0'></meta>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Script 
          src="https://s.skimresources.com/js/YOUR_SKIMLINKS_ID.skimlinks.js" 
          strategy="afterInteractive" 
        />
        {children}
      </body>
    </html>
  );
}