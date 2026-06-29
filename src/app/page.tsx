"use client"

import { useState } from "react"
import { useStore, daysOverdue } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Search, MapPin, ArrowRight, PackageSearch, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

function greeting() {
  const h = new Date().getHours()
  if (h < 6)  return "Bonne nuit"
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

  const upToDate   = data.tasks.filter(t => daysOverdue(t) <= 0 && t.last_done_at).length
  const totalTasks = data.tasks.length
  const healthPct  = totalTasks > 0 ? Math.round((upToDate / totalTasks) * 100) : 100
  const isNickel   = overdueTasks.length === 0

  const searching = query.trim().length >= 2
  const results = searching
    ? data.items.filter(i =>
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
        (i.description ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : []

  const zoneOf     = (id: string | null) => data.zones.find(z => z.id === id)
  const roomOfZone = (id: string | null) => { const z = zoneOf(id); return z ? data.rooms.find(r => r.id === z.room_id) : null }
  const roomOf     = (id: string) => data.rooms.find(r => r.id === id)
  const zonesOf    = (room_id: string) => data.zones.filter(z => z.room_id === room_id)
  const itemsOf    = (zone_id: string) => data.items.filter(i => i.zone_id === zone_id)
  const itemCountOf= (room_id: string) => zonesOf(room_id).reduce((n, z) => n + itemsOf(z.id).length, 0)

  return (
    <div className="flex flex-col min-h-full">

      {/* ── HEADER ── */}
      <div className={cn(
        "relative px-5 pt-10 pb-9 text-white overflow-hidden bg-gradient-to-br",
        isNickel ? "from-indigo-600 via-indigo-500 to-violet-500" : "from-indigo-700 via-indigo-600 to-violet-600"
      )}>
        {/* bg circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/[0.06]" />
        <div className="absolute top-6 -right-2 w-28 h-28 rounded-full bg-white/[0.04]" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/[0.04]" />

        {/* Avatar */}
        <div className="absolute top-10 right-5 w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-white text-base select-none">
          R
        </div>

        <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-[0.12em] mb-1.5 capitalize">{todayLabel()}</p>
        <h1 className="text-[26px] font-bold leading-tight pr-14">{greeting()}, Riadh</h1>

        {/* Health chip */}
        <div className="mt-4 inline-flex items-center gap-2.5 bg-white/15 rounded-2xl px-3.5 py-2">
          <TrendingUp size={13} className="text-white/80 shrink-0" />
          <span className="text-[12px] font-semibold text-white">
            {isNickel ? "Appartement nickel ✓" : `Ménage : ${healthPct}% à jour`}
          </span>
          <div className="w-14 h-1.5 rounded-full bg-white/25 overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${healthPct}%` }} />
          </div>
        </div>
      </div>

      {/* ── SEARCH ── */}
      <div className="px-4 -mt-5 z-10 relative">
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Où est mon passeport, mes clés…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10 h-12 bg-white shadow-xl border-0 rounded-2xl text-sm focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-0 placeholder:text-slate-400"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-xl leading-none">
              ×
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 mt-5 pb-4 space-y-6">

        {/* ── SEARCH RESULTS ── */}
        {searching && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <div className="flex flex-col items-center py-14 gap-3 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <PackageSearch size={28} strokeWidth={1.2} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-500">Objet introuvable</p>
                  <p className="text-xs text-slate-400 mt-0.5">«&thinsp;{query}&thinsp;» n'est pas dans l'inventaire</p>
                </div>
              </div>
            ) : (
              <>
                <p className="section-label">{results.length} résultat{results.length > 1 ? "s" : ""}</p>
                {results.map(item => {
                  const zone = zoneOf(item.zone_id)
                  const room = roomOfZone(item.zone_id)
                  return (
                    <div key={item.id} className="card flex items-start gap-3 p-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <MapPin size={17} className="text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                        {zone && room ? (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {room.icon}&nbsp;{room.name}&nbsp;<span className="text-slate-300">›</span>&nbsp;{zone.name}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 mt-0.5">Emplacement non défini</p>
                        )}
                        {item.description && <p className="text-xs text-slate-400 mt-0.5 italic">{item.description}</p>}
                        {item.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {item.tags.map(tag => (
                              <span key={tag} className="text-[10px] font-bold bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full">{tag}</span>
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

        {/* ── DASHBOARD ── */}
        {!searching && (
          <>
            {/* Quick nav cards */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/inventaire" className="card relative flex items-center gap-3 p-4 active:scale-[0.96] transition-transform">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shrink-0">🗃️</div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700">Inventaire</p>
                  <p className="text-xs text-slate-400 mt-0.5">{data.items.length} objets</p>
                </div>
                <ArrowRight size={13} className="absolute top-3 right-3 text-slate-300" />
              </Link>
              <Link href="/menage" className="card relative flex items-center gap-3 p-4 active:scale-[0.96] transition-transform">
                <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center text-xl shrink-0">🧹</div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700">Ménage</p>
                  <p className="text-xs text-slate-400 mt-0.5">{data.tasks.length} routines</p>
                </div>
                {overdueTasks.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 rounded-full bg-red-500 flex items-center justify-center px-1">
                    <span className="text-[10px] font-bold text-white">{overdueTasks.length}</span>
                  </span>
                )}
              </Link>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Pièces",   value: data.rooms.length,  emoji: "🏠" },
                { label: "Objets",   value: data.items.length,  emoji: "📦" },
                { label: "Routines", value: data.tasks.length,  emoji: "✅" },
              ].map(s => (
                <div key={s.label} className="card p-3 text-center">
                  <p className="text-lg leading-none">{s.emoji}</p>
                  <p className="text-xl font-bold text-slate-700 mt-1.5 leading-none">{s.value}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Overdue / nickel */}
            {overdueTasks.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="section-label flex items-center gap-1.5">
                    <AlertTriangle size={10} className="text-red-400" />
                    Urgences · {overdueTasks.length}
                  </p>
                  <Link href="/menage" className="flex items-center gap-0.5 text-[11px] text-indigo-500 font-bold">
                    Tout voir <ArrowRight size={11} />
                  </Link>
                </div>
                {overdueTasks.slice(0, 3).map(({ task, overdue }) => {
                  const room    = roomOf(task.room_id)
                  const urgency = overdue >= 7 ? "high" : overdue >= 3 ? "mid" : "low"
                  return (
                    <Link key={task.id} href="/menage" className={cn(
                      "flex items-center gap-3 p-3.5 rounded-2xl border active:scale-[0.98] transition-transform",
                      urgency === "high" ? "bg-red-50 border-red-100" :
                      urgency === "mid"  ? "bg-orange-50 border-orange-100" : "bg-amber-50 border-amber-100"
                    )}>
                      <div className={cn("w-1 h-9 rounded-full shrink-0",
                        urgency === "high" ? "bg-red-400" :
                        urgency === "mid"  ? "bg-orange-400" : "bg-amber-400"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{task.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{room?.icon}&nbsp;{room?.name}</p>
                      </div>
                      <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0",
                        urgency === "high" ? "bg-red-100 text-red-600" :
                        urgency === "mid"  ? "bg-orange-100 text-orange-600" : "bg-amber-100 text-amber-700"
                      )}>+{overdue}j</span>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 gap-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-3xl">✨</span>
                <p className="text-sm font-bold text-emerald-700">Appartement nickel</p>
                <p className="text-xs text-emerald-500">Toutes les tâches sont à jour</p>
              </div>
            )}

            {/* Rooms carousel */}
            {data.rooms.length > 0 && (
              <div className="space-y-2.5">
                <p className="section-label">Pièces</p>
                <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1">
                  {data.rooms.map(room => {
                    const count = itemCountOf(room.id)
                    return (
                      <Link key={room.id} href="/inventaire" className="flex flex-col items-center gap-2 shrink-0 w-[68px] active:scale-90 transition-transform">
                        <div className="relative w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-2xl">
                          {room.icon}
                          {count > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-indigo-500 flex items-center justify-center px-0.5">
                              <span className="text-[9px] font-bold text-white">{count}</span>
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
