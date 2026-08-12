import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DisclaimerBar from "@/components/layout/DisclaimerBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const description =
  "Playbook-style courses for Indian retail investors and traders. Research, courses, and model portfolios, all in one place.";

export const metadata: Metadata = {
  title: "The Capital Gains: Learn to Invest Like a Pro",
  description,
  keywords: ["investing", "trading", "options", "equity", "Indian stock market", "courses"],
  openGraph: {
    title: "The Capital Gains",
    description,
    url: "https://thecapitalgains.com",
    siteName: "The Capital Gains",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Capital Gains",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0d0125] text-[#1C0F3F]">
        <DisclaimerBar />
        <Navbar />
        <main className="flex-1 w-full premium-hero-gradient">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
