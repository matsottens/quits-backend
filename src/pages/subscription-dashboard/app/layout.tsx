import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Quits - Subscription Manager",
  description: "Manage all your subscriptions in one place",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#FFEDD6] min-h-screen`}>
        <div className="max-w-md mx-auto h-screen overflow-hidden bg-[#FFEDD6]">{children}</div>
      </body>
    </html>
  )
}



import './globals.css'