import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { StoreProvider } from "@/lib/store"
import Nav from "@/components/Nav"
import { Toaster } from "sonner"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })

export const metadata: Metadata = {
  title: "HomeBase",
  description: "Organisez votre appartement — inventaire & ménage",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "HomeBase" },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={geist.variable}>
      <body className="bg-slate-200 min-h-screen antialiased">
        <StoreProvider>
          <div className="max-w-md mx-auto min-h-screen flex flex-col bg-[#F8F8FA] shadow-2xl relative overflow-hidden">
            <main className="flex-1 overflow-y-auto pb-28 scroll-smooth">{children}</main>
            <Nav />
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              style: { borderRadius: "14px", fontSize: "13px", fontWeight: 600 },
              duration: 2500,
            }}
          />
        </StoreProvider>
      </body>
    </html>
  )
}
