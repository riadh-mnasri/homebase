"use client"

import { useState } from "react"
import { useStore, daysOverdue } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Search, MapPin, ArrowRight, PackageSearch, TrendingUp } from "lucide-react"
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

  const zonesOf = (room_id: string) => data.zones.filter(z => z.room_id === room_id)
  const itemsOf = (zone_id: string) => data.items.filter(i => i.zone_id === zone_id)
  const itemCountOf = (room_id: string) =>
    zonesOf(room_id).reduce((n, z) => n + itemsOf(z.id).length, 0)

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 px-5 pt-10 pb-8 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute top-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/5" />

        {/* Avatar */}
        <div className="absolute top-10 right-5 w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
          <span className="text-white font-bold text-base">R</span>
        </div>

        <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest mb-1 capitalize">{todayLabel()}</p>
        <h1 className="text-2xl font-bold pr-14">{greeting()}, Riadh</h1>

        {/* Score pill */}
        <div className="mt-4 inline-flex items-center gap-2.5 bg-white/15 backdrop-blur rounded-2xl px-3.5 py-2">
          <TrendingUp size={14} className="text-white/80 shrink-0" />
          <span className="text-xs font-semibold text-white">
            {healthPct === 100 ? "Appartement nickel" : `Ménage : ${healthPct}% à jour`}
          </span>
          <div className="w-14 h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${healthPct}%` }} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 -mt-5">
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Où est mon passeport, mes clés…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10 h-12 bg-white shadow-xl border-0 rounded-2xl text-sm focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-0"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-xl leading-none font-light"
            >×</button>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 mt-5 pb-4 space-y-6">

        {/* Search results */}
        {searching && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3 text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <PackageSearch size={26} strokeWidth={1.2} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-500">Introuvable</p>
                  <p className="text-xs text-slate-400 mt-0.5">« {query} » n'est pas dans l'inventaire</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {results.length} résultat{results.length > 1 ? "s" : ""}
                </p>
                {results.map(item => {
                  const zone = zoneOf(item.zone_id)
                  const room = roomOfZone(item.zone_id)
                  return (
                    <div key={item.id} className="flex items-start gap-3 p-4 rounded-2xl bg-white shadow-sm border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <MapPin size={17} className="text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                        {zone && room ? (
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <span>{room.icon}</span>
                            <span>{room.name}</span>
                            <span className="text-slate-300">›</span>
                            <span>{zone.name}</span>
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 mt-0.5">Emplacement non défini</p>
                        )}
                        {item.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {item.tags.map(tag => (
                              <span key={tag} className="text-[10px] font-semibold bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full">
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

        {!searching && (
          <>
            {/* Quick nav with badges */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/inventaire" className="relative flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-[0.97] transition-transform">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shrink-0">🗃️</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700">Inventaire</p>
                  <p className="text-xs text-slate-400 mt-0.5">{data.items.length} objets</p>
                </div>
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                  <ArrowRight size={10} className="text-indigo-500" />
                </span>
              </Link>
              <Link href="/menage" className="relative flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-[0.97] transition-transform">
                <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center text-xl shrink-0">🧹</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700">Ménage</p>
                  <p className="text-xs text-slate-400 mt-0.5">{data.tasks.length} routines</p>
                </div>
                {overdueTasks.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 min-w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white px-0.5">{overdueTasks.length}</span>
                  </span>
                )}
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: "Pièces", value: data.rooms.length, emoji: "🏠" },
                { label: "Objets", value: data.items.length, emoji: "📦" },
                { label: "Routines", value: data.tasks.length, emoji: "✅" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-slate-100 shadow-sm">
                  <p className="text-lg">{s.emoji}</p>
                  <p className="text-xl font-bold text-slate-700 mt-0.5 leading-none">{s.value}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Overdue tasks */}
            {overdueTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Urgences</h2>
                  <Link href="/menage" className="flex items-center gap-0.5 text-xs text-indigo-500 font-semibold">
                    Voir tout <ArrowRight size={11} />
                  </Link>
                </div>
                {overdueTasks.slice(0, 3).map(({ task, overdue }) => {
                  const room = roomOf(task.room_id)
                  const urgency = overdue >= 7 ? "high" : overdue >= 3 ? "mid" : "low"
                  return (
                    <div key={task.id} className={cn(
                      "flex items-center gap-3 p-3.5 rounded-2xl border",
                      urgency === "high" ? "bg-red-50 border-red-100" :
                      urgency === "mid" ? "bg-orange-50 border-orange-100" : "bg-amber-50 border-amber-100"
                    )}>
                      <div className={cn(
                        "w-1 h-9 rounded-full shrink-0",
                        urgency === "high" ? "bg-red-400" :
                        urgency === "mid" ? "bg-orange-400" : "bg-amber-400"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{task.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{room?.icon} {room?.name}</p>
                      </div>
                      <span className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-full shrink-0",
                        urgency === "high" ? "bg-red-100 text-red-600" :
                        urgency === "mid" ? "bg-orange-100 text-orange-600" : "bg-amber-100 text-amber-700"
                      )}>+{overdue}j</span>
                    </div>
                  )
                })}
              </div>
            )}

            {overdueTasks.length === 0 && (
              <div className="flex flex-col items-center py-6 gap-2 bg-green-50 rounded-2xl border border-green-100">
                <span className="text-3xl">✨</span>
                <p className="text-sm font-bold text-green-700">Appartement nickel</p>
                <p className="text-xs text-green-500">Toutes les tâches sont à jour</p>
              </div>
            )}

            {/* Rooms carousel */}
            {data.rooms.length > 0 && (
              <div className="space-y-2.5">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pièces</h2>
                <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1" style={{ scrollbarWidth: "none" }}>
                  {data.rooms.map(room => {
                    const count = itemCountOf(room.id)
                    return (
                      <Link
                        key={room.id}
                        href="/inventaire"
                        className="flex flex-col items-center gap-2 shrink-0 w-[70px] active:scale-95 transition-transform"
                      >
                        <div className="relative w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-2xl">
                          {room.icon}
                          {count > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-indigo-500 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-white px-0.5">{count}</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold text-center leading-tight w-full truncate">{room.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
