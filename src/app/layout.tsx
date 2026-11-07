import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Providers from "../components/Providers";
import BottomNav from "../components/BottomNav";

export const metadata: Metadata = {
  title: "Punyam Store - A World of Spirituality",
  description: "Discover authentic spiritual products, astrology services, sacred journeys, enriching literature, cultural programs and a vibrant spiritual community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main className="main">{children}</main>
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
