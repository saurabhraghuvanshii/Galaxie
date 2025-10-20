import type { Metadata } from "next";
import {  Roboto } from "next/font/google";
import "./globals.css";



const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Galaxie - Video Platform",
  description: "A decentralized video platform powered by Solana",
  icons: {
    icon: "/Galaxie1.png",
    shortcut: "/Galaxie1.png",
    apple: "/Galaxie1.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={roboto.className}>
      <body>{children}</body>
    </html>
  )
}
