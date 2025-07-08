import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import UserSync from "@/components/user-sync"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DSA Patterns Practice Dashboard",
  description: "Master Data Structures & Algorithms with gamified learning",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <UserSync />
            <div className="min-h-screen bg-black">
              <div className="relative">{children}</div>
            </div>
            {/* <Toaster /> */}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
