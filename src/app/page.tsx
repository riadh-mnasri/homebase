"use client"

import { useState } from "react"
import { useStore, daysOverdue } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, AlertCircle, MapPin } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { data } = useStore()
  const [query, setQuery] = useState("")

  const overdueTasks = data.tasks
    .map(t => ({ task: t, overdue: daysOverdue(t) }))
    .filter(({ overdue }) => overdue > 0)
    .sort((a, b) => b.overdue - a.overdue)

  const roomOf = (room_id: string) => data.rooms.find(r => r.id === room_id)

  const results = query.trim().length >= 2
    ? data.items.filter(i =>
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
        (i.description ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : []

  const zoneOf = (zone_id: string | null) => data.zones.find(z => z.id === zone_id)
  const roomOfZone = (zone_id: string | null) => {
    const zone = zoneOf(zone_id)
    return zone ? data.rooms.find(r => r.id === zone.room_id) : null
  }

  return (
    <div className="p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-gray-900">HomeBase 🏠</h1>
        <p className="text-sm text-gray-400 mt-0.5">Tout a une place.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Où est mon passeport ?"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-indigo-500"
        />
      </div>

      {/* Search results */}
      {query.trim().length >= 2 && (
        <div className="space-y-2">
          {results.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucun objet trouvé pour « {query} »</p>
          ) : (
            results.map(item => {
              const zone = zoneOf(item.zone_id)
              const room = roomOfZone(item.zone_id)
              return (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div className="mt-0.5 text-indigo-400"><MapPin size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    {zone && room ? (
                      <p className="text-xs text-gray-500 mt-0.5">{room.icon} {room.name} › {zone.name}</p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">Emplacement non défini</p>
                    )}
                    {item.tags.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {item.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">{tag}</Badge>)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Overdue tasks */}
      {overdueTasks.length > 0 && query.trim().length < 2 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <AlertCircle size={15} className="text-red-400" />
              Tâches en retard
            </h2>
            <Link href="/menage" className="text-xs text-indigo-500 hover:underline">Voir tout</Link>
          </div>
          {overdueTasks.slice(0, 3).map(({ task, overdue }) => {
            const room = roomOf(task.room_id)
            return (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                <div>
                  <p className="text-sm font-medium text-gray-800">{task.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{room?.icon} {room?.name}</p>
                </div>
                <span className="text-xs font-semibold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
                  +{overdue}j
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick stats */}
      {query.trim().length < 2 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pièces", value: data.rooms.length, color: "text-indigo-600" },
            { label: "Objets", value: data.items.length, color: "text-green-600" },
            { label: "Tâches", value: data.tasks.length, color: "text-orange-600" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center border border-gray-100 bg-gray-50">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
