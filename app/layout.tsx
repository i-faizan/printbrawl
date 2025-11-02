import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Print Brawl - iPhone & Samsung Case Battle | Two Designs. One Stays. One Disappears.",
  description: "Every 48 hours, one mobile case design wins and stays forever. The loser is replaced. Compatible with iPhone & Samsung. $24.99 for all models.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}