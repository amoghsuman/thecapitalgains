import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import DisclaimerBar from "@/components/layout/DisclaimerBar";
import Navbar from "@/components/layout/Navbar";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      className={`${playfair.variable} ${plusJakarta.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAF7] text-[#111111]">
        <DisclaimerBar />
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
