import type { Metadata } from "next";
import { Outfit, DM_Mono } from "next/font/google";
import "./globals.css";
import DisclaimerBar from "@/components/layout/DisclaimerBar";
import Navbar from "@/components/layout/Navbar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
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
      className={`${outfit.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#1C0F3F]">
        <DisclaimerBar />
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
