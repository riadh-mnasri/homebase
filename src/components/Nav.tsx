"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Layers, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/inventaire", label: "Inventaire", icon: Layers },
  { href: "/menage", label: "Ménage", icon: Sparkles },
]

export default function Nav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-md border-t border-slate-100 flex safe-bottom shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 relative"
          >
            <span className={cn(
              "flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200",
              active ? "bg-indigo-100" : ""
            )}>
              <Icon
                size={18}
                strokeWidth={active ? 2.5 : 1.8}
                className={cn(
                  "transition-colors duration-200",
                  active ? "text-indigo-600" : "text-slate-400"
                )}
              />
            </span>
            <span className={cn(
              "text-[10px] font-semibold tracking-wide transition-colors duration-200",
              active ? "text-indigo-600" : "text-slate-400"
            )}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
