import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import DisclaimerBar from "@/components/layout/DisclaimerBar";
import Navbar from "@/components/layout/Navbar";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "The Capital Gains — Learn to Invest Like a Pro",
  description:
    "Text-first, exercise-driven courses for Indian retail investors and traders. Read, apply, repeat.",
  keywords: ["investing", "trading", "options", "equity", "Indian stock market", "courses"],
  openGraph: {
    title: "The Capital Gains",
    description: "Learn to invest like a pro. Not gamble like a beginner.",
    url: "https://thecapitalgains.com",
    siteName: "The Capital Gains",
    locale: "en_IN",
    type: "website",
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
      className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAF7] text-[#1A1A2E]">
        <DisclaimerBar />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}