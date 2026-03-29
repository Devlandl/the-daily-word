import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://thedailyword.tvrapp.app"),
  title: {
    default: "The Daily Word - AI-Powered Devotional Reading Plans",
    template: "%s | The Daily Word",
  },
  description: "Create personalized devotional reading plans from any Bible topic, verse, or book. Each day includes scripture, reflection, prayer prompts, and daily challenges. Free for everyone.",
  keywords: ["devotional", "reading plan", "bible study", "daily devotional", "scripture reading", "prayer guide", "bible reading plan"],
  authors: [{ name: "TVR App Store" }],
  creator: "TVR App Store",
  publisher: "TVR App Store",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://thedailyword.tvrapp.app",
    siteName: "The Daily Word",
    title: "The Daily Word - AI-Powered Devotional Reading Plans",
    description: "Create personalized devotional reading plans. Free for everyone.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "The Daily Word - AI-Powered Devotional Reading Plans" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Daily Word - AI-Powered Devotional Reading Plans",
    description: "Create personalized devotional reading plans. Free for everyone.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-brand-black text-brand-white`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
