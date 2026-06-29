"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutGrid, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/inventaire", label: "Inventaire", icon: LayoutGrid },
  { href: "/menage", label: "Ménage", icon: CheckSquare },
]

export default function Nav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
              active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
