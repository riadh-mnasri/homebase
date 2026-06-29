import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { StoreProvider } from "@/lib/store"
import Nav from "@/components/Nav"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HomeBase",
  description: "Organisez votre appartement",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <StoreProvider>
          <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white shadow-sm">
            <main className="flex-1 overflow-auto pb-20">{children}</main>
            <Nav />
          </div>
        </StoreProvider>
      </body>
    </html>
  )
}
