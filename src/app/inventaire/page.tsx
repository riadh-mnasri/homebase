"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Room, Zone } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronRight, Plus, Trash2, ChevronLeft, Package, FolderOpen, BoxSelect } from "lucide-react"
import { cn } from "@/lib/utils"

type View = { type: "rooms" } | { type: "zones"; room: Room } | { type: "items"; room: Room; zone: Zone }

const ROOM_GRADIENTS = [
  { bg: "from-blue-400 to-blue-500", light: "bg-blue-50", border: "border-blue-100", text: "text-blue-600" },
  { bg: "from-orange-400 to-amber-500", light: "bg-orange-50", border: "border-orange-100", text: "text-orange-600" },
  { bg: "from-violet-400 to-purple-500", light: "bg-violet-50", border: "border-violet-100", text: "text-violet-600" },
  { bg: "from-cyan-400 to-teal-500", light: "bg-cyan-50", border: "border-cyan-100", text: "text-cyan-600" },
  { bg: "from-emerald-400 to-green-500", light: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600" },
  { bg: "from-yellow-400 to-orange-400", light: "bg-yellow-50", border: "border-yellow-100", text: "text-yellow-600" },
  { bg: "from-pink-400 to-rose-500", light: "bg-pink-50", border: "border-pink-100", text: "text-pink-600" },
  { bg: "from-indigo-400 to-indigo-600", light: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-600" },
]
const ROOM_ICONS = ["🛋️", "🍳", "🛏️", "🚿", "🚪", "💻", "📦", "🪴"]

export default function Inventaire() {
  const { data, addRoom, deleteRoom, addZone, deleteZone, addItem, deleteItem } = useStore()
  const [view, setView] = useState<View>({ type: "rooms" })
  const [dialog, setDialog] = useState<"room" | "zone" | "item" | null>(null)
  const [form, setForm] = useState({ name: "", tags: "", description: "" })
  const [deleting, setDeleting] = useState<string | null>(null)

  const zonesOf = (room_id: string) => data.zones.filter(z => z.room_id === room_id)
  const itemsOf = (zone_id: string) => data.items.filter(i => i.zone_id === zone_id)

  function getGradient(idx: number) {
    return ROOM_GRADIENTS[idx % ROOM_GRADIENTS.length]
  }
  function getRoomGradient(room: Room) {
    const idx = data.rooms.findIndex(r => r.id === room.id)
    return getGradient(idx)
  }

  function submit() {
    if (!form.name.trim()) return
    if (dialog === "room") {
      const idx = data.rooms.length % ROOM_GRADIENTS.length
      addRoom({ name: form.name, icon: ROOM_ICONS[idx], color: ROOM_GRADIENTS[idx].light })
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

  const goBack = () => {
    if (view.type === "items") setView({ type: "zones", room: view.room })
    else setView({ type: "rooms" })
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      {view.type === "rooms" ? (
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 px-5 pt-10 pb-6 text-white">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">Organisez</p>
          <h1 className="text-2xl font-bold">Inventaire</h1>
          <p className="text-slate-400 text-sm mt-1">{data.rooms.length} pièces · {data.items.length} objets</p>
        </div>
      ) : (
        <div className={cn(
          "bg-gradient-to-br px-5 pt-10 pb-6 text-white",
          view.type === "zones" ? `${getRoomGradient(view.room).bg}` : `${getRoomGradient(view.room).bg}`
        )}>
          <button onClick={goBack} className="flex items-center gap-1 text-white/70 text-sm mb-3 -ml-1 hover:text-white transition-colors">
            <ChevronLeft size={16} /> Retour
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>{view.type === "zones" ? view.room.icon : view.room.icon}</span>
            <span>{view.type === "zones" ? view.room.name : view.zone.name}</span>
          </h1>
          {view.type === "items" && (
            <p className="text-white/70 text-sm mt-1">{view.room.name} · {itemsOf(view.zone.id).length} objet{itemsOf(view.zone.id).length !== 1 ? "s" : ""}</p>
          )}
          {view.type === "zones" && (
            <p className="text-white/70 text-sm mt-1">{zonesOf(view.room.id).length} zones</p>
          )}
        </div>
      )}

      <div className="flex-1 px-4 pt-4 pb-4 space-y-3">

        {/* Rooms grid */}
        {view.type === "rooms" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {data.rooms.map((room, idx) => {
                const zones = zonesOf(room.id)
                const count = zones.reduce((n, z) => n + itemsOf(z.id).length, 0)
                const g = getGradient(idx)
                return (
                  <div
                    key={room.id}
                    className="relative bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                    onClick={() => setView({ type: "zones", room })}
                  >
                    <div className={`bg-gradient-to-br ${g.bg} h-16 flex items-center justify-center`}>
                      <span className="text-3xl">{room.icon}</span>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-slate-800 text-sm truncate">{room.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{zones.length} zones · {count} obj.</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setDeleting(room.id) }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-white/60 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => setDialog("room")}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Ajouter une pièce</span>
            </button>
          </>
        )}

        {/* Zones */}
        {view.type === "zones" && (
          <>
            {zonesOf(view.room.id).map(zone => {
              const count = itemsOf(zone.id).length
              const g = getRoomGradient(view.room)
              return (
                <div
                  key={zone.id}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                  onClick={() => setView({ type: "items", room: view.room, zone })}
                >
                  <div className={`w-10 h-10 rounded-xl ${g.light} ${g.border} border flex items-center justify-center shrink-0`}>
                    <FolderOpen size={18} className={g.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700 text-sm">{zone.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{count} objet{count !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); deleteZone(zone.id) }} className="p-1.5 text-slate-200 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </div>
              )
            })}
            {zonesOf(view.room.id).length === 0 && (
              <div className="flex flex-col items-center py-10 gap-2 text-slate-400">
                <BoxSelect size={32} strokeWidth={1.2} />
                <p className="text-sm">Aucune zone. Ajoutez un placard, tiroir…</p>
              </div>
            )}
            <button
              onClick={() => setDialog("zone")}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Ajouter une zone</span>
            </button>
          </>
        )}

        {/* Items */}
        {view.type === "items" && (
          <>
            {itemsOf(view.zone.id).map(item => (
              <div key={item.id} className="flex items-start gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Package size={16} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-700 text-sm">{item.name}</p>
                  {item.description && <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>}
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
                <button onClick={() => deleteItem(item.id)} className="p-1.5 text-slate-200 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {itemsOf(view.zone.id).length === 0 && (
              <div className="flex flex-col items-center py-10 gap-2 text-slate-400">
                <Package size={32} strokeWidth={1.2} />
                <p className="text-sm">Aucun objet dans cette zone.</p>
              </div>
            )}
            <button
              onClick={() => setDialog("item")}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Ajouter un objet</span>
            </button>
          </>
        )}
      </div>

      {/* Delete confirmation */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-xs mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Supprimer cette pièce ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Toutes les zones et tâches associées seront supprimées.</p>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setDeleting(null)}>Annuler</Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={() => { deleteRoom(deleting!); setDeleting(null) }}>
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add dialog */}
      <Dialog open={!!dialog} onOpenChange={() => { setDialog(null); setForm({ name: "", tags: "", description: "" }) }}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {dialog === "room" && "Nouvelle pièce"}
              {dialog === "zone" && "Nouvelle zone"}
              {dialog === "item" && "Nouvel objet"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              placeholder={
                dialog === "room" ? "Ex : Salon, Chambre, Cave…" :
                dialog === "zone" ? "Ex : Tiroir du haut, Placard…" :
                "Nom de l'objet"
              }
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && submit()}
              className="rounded-xl h-11"
              autoFocus
            />
            {dialog === "item" && (
              <>
                <Input
                  placeholder="Description (optionnel)"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="rounded-xl h-11"
                />
                <Input
                  placeholder="Tags : documents, important, outils…"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  className="rounded-xl h-11"
                />
              </>
            )}
            <Button
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              onClick={submit}
              disabled={!form.name.trim()}
            >
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
