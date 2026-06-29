"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Room, Zone, Item } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronRight, Plus, Trash2, ChevronLeft, Package } from "lucide-react"

type View = { type: "rooms" } | { type: "zones"; room: Room } | { type: "items"; room: Room; zone: Zone }

export default function Inventaire() {
  const { data, addRoom, deleteRoom, addZone, deleteZone, addItem, deleteItem } = useStore()
  const [view, setView] = useState<View>({ type: "rooms" })
  const [dialog, setDialog] = useState<"room" | "zone" | "item" | null>(null)
  const [form, setForm] = useState({ name: "", tags: "", description: "" })

  const ROOM_COLORS = [
    "bg-blue-50 border-blue-200",
    "bg-orange-50 border-orange-200",
    "bg-purple-50 border-purple-200",
    "bg-cyan-50 border-cyan-200",
    "bg-green-50 border-green-200",
    "bg-yellow-50 border-yellow-200",
    "bg-pink-50 border-pink-200",
    "bg-red-50 border-red-200",
  ]
  const ROOM_ICONS = ["🛋️", "🍳", "🛏️", "🚿", "🚪", "💻", "📦", "🪴"]

  function submit() {
    if (!form.name.trim()) return
    if (dialog === "room") {
      const idx = data.rooms.length % ROOM_COLORS.length
      addRoom({ name: form.name, icon: ROOM_ICONS[idx], color: ROOM_COLORS[idx] })
    }
    if (dialog === "zone" && view.type === "zones") {
      addZone({ name: form.name, room_id: view.room.id })
    }
    if (dialog === "item" && view.type === "items") {
      addItem({
        name: form.name,
        zone_id: view.zone.id,
        description: form.description || undefined,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      })
    }
    setForm({ name: "", tags: "", description: "" })
    setDialog(null)
  }

  const zonesOf = (room_id: string) => data.zones.filter(z => z.room_id === room_id)
  const itemsOf = (zone_id: string) => data.items.filter(i => i.zone_id === zone_id)

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-4 flex items-center gap-2">
        {view.type !== "rooms" && (
          <button onClick={() => {
            if (view.type === "items") setView({ type: "zones", room: view.room })
            else setView({ type: "rooms" })
          }} className="p-1 -ml-1 text-gray-400 hover:text-gray-700">
            <ChevronLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {view.type === "rooms" && "Inventaire"}
            {view.type === "zones" && `${view.room.icon} ${view.room.name}`}
            {view.type === "items" && view.zone.name}
          </h1>
          {view.type === "items" && (
            <p className="text-xs text-gray-400">{view.room.icon} {view.room.name}</p>
          )}
        </div>
      </div>

      {/* Rooms */}
      {view.type === "rooms" && (
        <div className="space-y-2">
          {data.rooms.map(room => {
            const count = zonesOf(room.id).reduce((n, z) => n + itemsOf(z.id).length, 0)
            return (
              <div
                key={room.id}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${room.color}`}
                onClick={() => setView({ type: "zones", room })}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{room.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{room.name}</p>
                    <p className="text-xs text-gray-400">{zonesOf(room.id).length} zones · {count} objets</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); deleteRoom(room.id) }} className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </div>
            )
          })}
          <Button variant="outline" className="w-full border-dashed text-gray-400 hover:text-gray-600" onClick={() => setDialog("room")}>
            <Plus size={16} className="mr-1" /> Ajouter une pièce
          </Button>
        </div>
      )}

      {/* Zones */}
      {view.type === "zones" && (
        <div className="space-y-2">
          {zonesOf(view.room.id).map(zone => {
            const count = itemsOf(zone.id).length
            return (
              <div
                key={zone.id}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setView({ type: "items", room: view.room, zone })}
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">{zone.name}</p>
                  <p className="text-xs text-gray-400">{count} objet{count !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); deleteZone(zone.id) }} className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </div>
            )
          })}
          {zonesOf(view.room.id).length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Aucune zone. Ajoutez un placard, tiroir, étagère…</p>
          )}
          <Button variant="outline" className="w-full border-dashed text-gray-400 hover:text-gray-600" onClick={() => setDialog("zone")}>
            <Plus size={16} className="mr-1" /> Ajouter une zone
          </Button>
        </div>
      )}

      {/* Items */}
      {view.type === "items" && (
        <div className="space-y-2">
          {itemsOf(view.zone.id).map(item => (
            <div key={item.id} className="flex items-start justify-between p-3 rounded-xl border border-gray-100 bg-white">
              <div className="flex items-start gap-2">
                <Package size={16} className="mt-0.5 text-gray-300 shrink-0" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                  {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                  {item.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {item.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">{tag}</Badge>)}
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => deleteItem(item.id)} className="p-1 text-gray-300 hover:text-red-400 transition-colors shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {itemsOf(view.zone.id).length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Aucun objet dans cette zone.</p>
          )}
          <Button variant="outline" className="w-full border-dashed text-gray-400 hover:text-gray-600" onClick={() => setDialog("item")}>
            <Plus size={16} className="mr-1" /> Ajouter un objet
          </Button>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>
              {dialog === "room" && "Nouvelle pièce"}
              {dialog === "zone" && "Nouvelle zone"}
              {dialog === "item" && "Nouvel objet"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              placeholder={dialog === "item" ? "Nom de l'objet" : "Nom"}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && submit()}
            />
            {dialog === "item" && (
              <>
                <Input
                  placeholder="Description (optionnel)"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
                <Input
                  placeholder="Tags séparés par virgule (ex: documents, important)"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                />
              </>
            )}
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={submit}>
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
