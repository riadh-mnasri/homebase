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
  { bg: "from-blue-400 to-blue-600", light: "bg-blue-50", border: "border-blue-100", text: "text-blue-600", pill: "bg-blue-100 text-blue-700" },
  { bg: "from-orange-400 to-amber-500", light: "bg-orange-50", border: "border-orange-100", text: "text-orange-600", pill: "bg-orange-100 text-orange-700" },
  { bg: "from-violet-400 to-purple-600", light: "bg-violet-50", border: "border-violet-100", text: "text-violet-600", pill: "bg-violet-100 text-violet-700" },
  { bg: "from-cyan-400 to-teal-500", light: "bg-cyan-50", border: "border-cyan-100", text: "text-cyan-700", pill: "bg-cyan-100 text-cyan-700" },
  { bg: "from-emerald-400 to-green-600", light: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", pill: "bg-emerald-100 text-emerald-700" },
  { bg: "from-yellow-400 to-orange-400", light: "bg-yellow-50", border: "border-yellow-100", text: "text-yellow-700", pill: "bg-yellow-100 text-yellow-700" },
  { bg: "from-pink-400 to-rose-500", light: "bg-pink-50", border: "border-pink-100", text: "text-pink-600", pill: "bg-pink-100 text-pink-700" },
  { bg: "from-indigo-400 to-indigo-700", light: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-600", pill: "bg-indigo-100 text-indigo-700" },
]

const ROOM_ICONS = ["🛋️","🍳","🛏️","🚿","🚪","💻","📦","🪴","🧺","🪑","🛁","🚗","📚","🎮","🪞","🗄️"]

export default function Inventaire() {
  const { data, addRoom, deleteRoom, addZone, deleteZone, addItem, deleteItem } = useStore()
  const [view, setView] = useState<View>({ type: "rooms" })
  const [dialog, setDialog] = useState<"room" | "zone" | "item" | null>(null)
  const [form, setForm] = useState({ name: "", tags: "", description: "", icon: "🛋️", colorIdx: 0 })
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const zonesOf = (room_id: string) => data.zones.filter(z => z.room_id === room_id)
  const itemsOf = (zone_id: string) => data.items.filter(i => i.zone_id === zone_id)

  function getGradient(idx: number) { return ROOM_GRADIENTS[idx % ROOM_GRADIENTS.length] }
  function getRoomGradient(room: Room) {
    return getGradient(data.rooms.findIndex(r => r.id === room.id))
  }

  function submit() {
    if (!form.name.trim()) return
    if (dialog === "room") {
      const g = ROOM_GRADIENTS[form.colorIdx % ROOM_GRADIENTS.length]
      addRoom({ name: form.name, icon: form.icon, color: g.light })
    }
    if (dialog === "zone" && view.type === "zones") addZone({ name: form.name, room_id: view.room.id })
    if (dialog === "item" && view.type === "items") {
      addItem({
        name: form.name, zone_id: view.zone.id,
        description: form.description || undefined,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      })
    }
    setForm({ name: "", tags: "", description: "", icon: "🛋️", colorIdx: 0 })
    setDialog(null)
  }

  const currentRoom = view.type !== "rooms" ? view.room : null
  const g = currentRoom ? getRoomGradient(currentRoom) : null

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      {view.type === "rooms" ? (
        <div className="relative bg-gradient-to-br from-slate-700 to-slate-900 px-5 pt-10 pb-6 text-white overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute bottom-0 -left-8 w-28 h-28 rounded-full bg-white/5" />
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">Votre appartement</p>
          <h1 className="text-2xl font-bold">Inventaire</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs bg-white/10 rounded-full px-2.5 py-1 text-slate-300">{data.rooms.length} pièces</span>
            <span className="text-xs bg-white/10 rounded-full px-2.5 py-1 text-slate-300">{data.items.length} objets</span>
          </div>
        </div>
      ) : (
        <div className={cn("relative bg-gradient-to-br px-5 pt-10 pb-6 text-white overflow-hidden", g?.bg)}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-white/60 text-xs mb-3">
            <button onClick={() => setView({ type: "rooms" })} className="hover:text-white transition-colors">Inventaire</button>
            {view.type === "zones" && (
              <><span>›</span><span className="text-white font-medium">{view.room.name}</span></>
            )}
            {view.type === "items" && (
              <>
                <span>›</span>
                <button onClick={() => setView({ type: "zones", room: view.room })} className="hover:text-white transition-colors">{view.room.name}</button>
                <span>›</span>
                <span className="text-white font-medium">{view.zone.name}</span>
              </>
            )}
          </div>

          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">{view.type === "zones" ? view.room.icon : view.room.icon}</span>
            <span>{view.type === "zones" ? view.room.name : view.zone.name}</span>
          </h1>
          <p className="text-white/60 text-xs mt-1">
            {view.type === "zones"
              ? `${zonesOf(view.room.id).length} zones · ${zonesOf(view.room.id).reduce((n, z) => n + itemsOf(z.id).length, 0)} objets`
              : `${view.room.name} · ${itemsOf(view.zone.id).length} objet${itemsOf(view.zone.id).length !== 1 ? "s" : ""}`}
          </p>
        </div>
      )}

      <div className="flex-1 px-4 pt-4 pb-4 space-y-3">

        {/* Rooms 2-col grid */}
        {view.type === "rooms" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {data.rooms.map((room, idx) => {
                const zones = zonesOf(room.id)
                const count = zones.reduce((n, z) => n + itemsOf(z.id).length, 0)
                const gradient = getGradient(idx)
                return (
                  <div
                    key={room.id}
                    className="relative bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md active:scale-[0.97] transition-all"
                    onClick={() => setView({ type: "zones", room })}
                  >
                    <div className={cn("bg-gradient-to-br h-[72px] flex items-end pb-2 px-3 justify-between", gradient.bg)}>
                      <span className="text-3xl drop-shadow">{room.icon}</span>
                      {count > 0 && (
                        <span className="text-[10px] font-bold bg-white/25 text-white px-1.5 py-0.5 rounded-full mb-1">
                          {count}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-slate-700 text-sm truncate">{room.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{zones.length} zone{zones.length !== 1 ? "s" : ""}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDelete(room.id) }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/10 backdrop-blur flex items-center justify-center hover:bg-white/90 transition-colors group"
                    >
                      <Trash2 size={11} className="text-white group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => setDialog("room")}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              <Plus size={18} /><span className="text-sm font-semibold">Ajouter une pièce</span>
            </button>
          </>
        )}

        {/* Zones */}
        {view.type === "zones" && (
          <>
            {zonesOf(view.room.id).map(zone => {
              const count = itemsOf(zone.id).length
              const gradient = getRoomGradient(view.room)
              return (
                <div
                  key={zone.id}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all"
                  onClick={() => setView({ type: "items", room: view.room, zone })}
                >
                  <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center shrink-0", gradient.light, gradient.border)}>
                    <FolderOpen size={19} className={gradient.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-700 text-sm">{zone.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{count} objet{count !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); deleteZone(zone.id) }} className="p-1.5 text-slate-200 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </div>
              )
            })}
            {zonesOf(view.room.id).length === 0 && (
              <div className="flex flex-col items-center py-12 gap-3 text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <BoxSelect size={26} strokeWidth={1.2} />
                </div>
                <p className="text-sm font-medium">Aucune zone</p>
                <p className="text-xs text-slate-300">Ajoutez un placard, tiroir, étagère…</p>
              </div>
            )}
            <button
              onClick={() => setDialog("zone")}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              <Plus size={18} /><span className="text-sm font-semibold">Ajouter une zone</span>
            </button>
          </>
        )}

        {/* Items */}
        {view.type === "items" && (
          <>
            {itemsOf(view.zone.id).map(item => (
              <div key={item.id} className="flex items-start gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Package size={17} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-700 text-sm">{item.name}</p>
                  {item.description && <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>}
                  {item.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => deleteItem(item.id)} className="p-1.5 text-slate-200 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {itemsOf(view.zone.id).length === 0 && (
              <div className="flex flex-col items-center py-12 gap-3 text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Package size={26} strokeWidth={1.2} />
                </div>
                <p className="text-sm font-medium">Zone vide</p>
                <p className="text-xs text-slate-300">Ajoutez vos premiers objets</p>
              </div>
            )}
            <button
              onClick={() => setDialog("item")}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              <Plus size={18} /><span className="text-sm font-semibold">Ajouter un objet</span>
            </button>
          </>
        )}
      </div>

      {/* Confirm delete room */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="max-w-xs mx-auto rounded-2xl">
          <DialogHeader><DialogTitle>Supprimer cette pièce ?</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Toutes les zones et tâches liées seront supprimées. Cette action est irréversible.</p>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setConfirmDelete(null)}>Annuler</Button>
            <Button className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white" onClick={() => { deleteRoom(confirmDelete!); setConfirmDelete(null) }}>
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add dialog */}
      <Dialog open={!!dialog} onOpenChange={() => { setDialog(null); setForm({ name: "", tags: "", description: "", icon: "🛋️", colorIdx: 0 }) }}>
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
                dialog === "zone" ? "Ex : Tiroir du haut, Placard…" : "Nom de l'objet"
              }
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && submit()}
              className="rounded-xl h-11"
              autoFocus
            />

            {/* Icon picker for rooms */}
            {dialog === "room" && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Icône</p>
                <div className="grid grid-cols-8 gap-1.5">
                  {ROOM_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setForm(f => ({ ...f, icon }))}
                      className={cn(
                        "w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all",
                        form.icon === icon ? "bg-indigo-100 ring-2 ring-indigo-400 scale-110" : "bg-slate-50 hover:bg-slate-100"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 mt-3">Couleur</p>
                <div className="flex gap-2">
                  {ROOM_GRADIENTS.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => setForm(f => ({ ...f, colorIdx: i }))}
                      className={cn(
                        `w-7 h-7 rounded-xl bg-gradient-to-br ${g.bg} transition-all`,
                        form.colorIdx === i ? "ring-2 ring-offset-1 ring-slate-400 scale-110" : ""
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {dialog === "item" && (
              <>
                <Input placeholder="Description (optionnel)" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="rounded-xl h-11" />
                <Input placeholder="Tags : documents, important, outils…" value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  className="rounded-xl h-11" />
              </>
            )}

            {/* Preview for room */}
            {dialog === "room" && form.name && (
              <div className={cn("flex items-center gap-3 p-3 rounded-xl border", ROOM_GRADIENTS[form.colorIdx % ROOM_GRADIENTS.length].light, ROOM_GRADIENTS[form.colorIdx % ROOM_GRADIENTS.length].border)}>
                <span className="text-2xl">{form.icon}</span>
                <p className="font-bold text-slate-700 text-sm">{form.name}</p>
              </div>
            )}

            <Button
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
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
