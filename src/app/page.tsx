"use client"

import { useState } from "react"
import { useStore, daysOverdue } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, ArrowRight, Clock, PackageSearch } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

function greeting() {
  const h = new Date().getHours()
  if (h < 6) return "Bonne nuit"
  if (h < 12) return "Bonjour"
  if (h < 18) return "Bon après-midi"
  return "Bonsoir"
}

function todayLabel() {
  return new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
}

export default function Dashboard() {
  const { data } = useStore()
  const [query, setQuery] = useState("")

  const overdueTasks = data.tasks
    .map(t => ({ task: t, overdue: daysOverdue(t) }))
    .filter(({ overdue }) => overdue > 0)
    .sort((a, b) => b.overdue - a.overdue)

  const upToDateCount = data.tasks.filter(t => daysOverdue(t) <= 0 && t.last_done_at).length
  const totalTasks = data.tasks.length
  const healthPct = totalTasks > 0 ? Math.round((upToDateCount / totalTasks) * 100) : 100

  const results = query.trim().length >= 2
    ? data.items.filter(i =>
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
        (i.description ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : []

  const zoneOf = (id: string | null) => data.zones.find(z => z.id === id)
  const roomOfZone = (id: string | null) => {
    const z = zoneOf(id)
    return z ? data.rooms.find(r => r.id === z.room_id) : null
  }
  const roomOf = (id: string) => data.rooms.find(r => r.id === id)

  const searching = query.trim().length >= 2

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 px-5 pt-10 pb-8 text-white">
        <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest mb-1 capitalize">{todayLabel()}</p>
        <h1 className="text-2xl font-bold">{greeting()}, Riadh</h1>

        {/* Score pill */}
        <div className="mt-4 inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-3 py-1.5">
          <span className="text-xs font-semibold text-white">
            {healthPct === 100 ? "Appartement nickel ✓" : `Ménage : ${healthPct}% à jour`}
          </span>
          <div className="w-16 h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${healthPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search — overlap on header */}
      <div className="px-4 -mt-5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Où est mon passeport ?"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10 h-12 bg-white shadow-lg border-0 rounded-2xl text-sm focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-0"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-lg leading-none"
            >×</button>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 mt-5 pb-4 space-y-5">

        {/* Search results */}
        {searching && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2 text-slate-400">
                <PackageSearch size={32} strokeWidth={1.2} />
                <p className="text-sm">Aucun objet pour «&nbsp;{query}&nbsp;»</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{results.length} résultat{results.length > 1 ? "s" : ""}</p>
                {results.map(item => {
                  const zone = zoneOf(item.zone_id)
                  const room = roomOfZone(item.zone_id)
                  return (
                    <div key={item.id} className="flex items-start gap-3 p-4 rounded-2xl bg-white shadow-sm border border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <MapPin size={16} className="text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                        {zone && room ? (
                          <p className="text-xs text-slate-500 mt-0.5">{room.icon} {room.name} › {zone.name}</p>
                        ) : (
                          <p className="text-xs text-slate-400 mt-0.5">Emplacement non défini</p>
                        )}
                        {item.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {item.tags.map(tag => (
                              <span key={tag} className="text-[10px] font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}

        {/* Normal dashboard */}
        {!searching && (
          <>
            {/* Quick nav */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/inventaire" className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shrink-0">🗃️</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700">Inventaire</p>
                  <p className="text-xs text-slate-400">{data.items.length} objets</p>
                </div>
              </Link>
              <Link href="/menage" className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-xl shrink-0">🧹</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700">Ménage</p>
                  <p className="text-xs text-slate-400">{data.tasks.length} tâches</p>
                </div>
              </Link>
            </div>

            {/* Overdue tasks */}
            {overdueTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">En retard</h2>
                  <Link href="/menage" className="flex items-center gap-0.5 text-xs text-indigo-500 font-medium">
                    Tout voir <ArrowRight size={12} />
                  </Link>
                </div>
                {overdueTasks.slice(0, 4).map(({ task, overdue }) => {
                  const room = roomOf(task.room_id)
                  const urgency = overdue >= 7 ? "high" : overdue >= 3 ? "mid" : "low"
                  return (
                    <div key={task.id} className={cn(
                      "flex items-center gap-3 p-3.5 rounded-2xl border",
                      urgency === "high" ? "bg-red-50 border-red-100" :
                      urgency === "mid" ? "bg-orange-50 border-orange-100" :
                      "bg-amber-50 border-amber-100"
                    )}>
                      <div className={cn(
                        "w-1.5 h-8 rounded-full shrink-0",
                        urgency === "high" ? "bg-red-400" :
                        urgency === "mid" ? "bg-orange-400" : "bg-amber-400"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{task.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          {room?.icon} {room?.name}
                        </p>
                      </div>
                      <span className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-full shrink-0",
                        urgency === "high" ? "bg-red-100 text-red-600" :
                        urgency === "mid" ? "bg-orange-100 text-orange-600" :
                        "bg-amber-100 text-amber-600"
                      )}>
                        +{overdue}j
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* All clean state */}
            {overdueTasks.length === 0 && (
              <div className="flex flex-col items-center py-8 gap-2">
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">✨</div>
                <p className="text-sm font-semibold text-slate-600">Tout est à jour</p>
                <p className="text-xs text-slate-400">L'appartement est nickel</p>
              </div>
            )}

            {/* Rooms shortcut */}
            {data.rooms.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pièces</h2>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
                  {data.rooms.map(room => (
                    <Link
                      key={room.id}
                      href="/inventaire"
                      className="flex flex-col items-center gap-1.5 shrink-0 w-16"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-xl">
                        {room.icon}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium text-center leading-tight">{room.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
