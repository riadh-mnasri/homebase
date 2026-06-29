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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-1px_16px_rgba(0,0,0,0.07)]">
      <div className="flex">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-0.5 pt-2.5 pb-1 relative"
            >
              <span className={cn(
                "flex items-center justify-center w-11 h-7 rounded-xl transition-all duration-200",
                active ? "bg-indigo-100" : ""
              )}>
                <Icon
                  size={19}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={cn("transition-colors duration-200", active ? "text-indigo-600" : "text-slate-400")}
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
      </div>
      <p className="text-center text-[9px] text-slate-300 pb-2 mt-0.5 tracking-wide">
        © 2026 Riadh MNASRI · WeHighTech
      </p>
    </nav>
  )
}
