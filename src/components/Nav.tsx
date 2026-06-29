"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Layers, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/",          label: "Accueil",   icon: Home      },
  { href: "/inventaire",label: "Inventaire",icon: Layers    },
  { href: "/menage",    label: "Ménage",    icon: Sparkles  },
]

export default function Nav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div className="bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center pt-2.5 pb-1.5 gap-0.5"
              >
                <span className={cn(
                  "flex items-center justify-center w-12 h-7 rounded-xl transition-all duration-200",
                  active ? "bg-indigo-100" : ""
                )}>
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={cn(
                      "transition-colors duration-200",
                      active ? "text-indigo-600" : "text-slate-400"
                    )}
                  />
                </span>
                <span className={cn(
                  "text-[10px] font-semibold leading-none transition-colors duration-200",
                  active ? "text-indigo-600" : "text-slate-400"
                )}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
        <p className="text-center text-[9px] font-medium text-slate-300 pb-2.5 mt-0.5 tracking-widest safe-pb">
          © 2026 Riadh MNASRI · WeHighTech
        </p>
      </div>
    </nav>
  )
}
