"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Room, Zone, Item } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronRight, Plus, Trash2, Pencil, Package, FolderOpen, BoxSelect } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type View = { type: "rooms" } | { type: "zones"; room: Room } | { type: "items"; room: Room; zone: Zone }
type SheetMode =
  | { kind: "add-room" }
  | { kind: "add-zone"; room: Room }
  | { kind: "add-item"; room: Room; zone: Zone }
  | { kind: "edit-item"; item: Item }
  | { kind: "edit-zone"; zone: Zone }
  | null

const GRADIENTS = [
  { bg: "from-blue-400 to-blue-600",     light: "bg-blue-50",    border: "border-blue-100",    text: "text-blue-600"    },
  { bg: "from-orange-400 to-amber-500",  light: "bg-orange-50",  border: "border-orange-100",  text: "text-orange-600"  },
  { bg: "from-violet-400 to-purple-600", light: "bg-violet-50",  border: "border-violet-100",  text: "text-violet-600"  },
  { bg: "from-cyan-400 to-teal-500",     light: "bg-cyan-50",    border: "border-cyan-100",    text: "text-cyan-700"    },
  { bg: "from-emerald-400 to-green-600", light: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700" },
  { bg: "from-yellow-400 to-orange-400", light: "bg-yellow-50",  border: "border-yellow-100",  text: "text-yellow-700"  },
  { bg: "from-pink-400 to-rose-500",     light: "bg-pink-50",    border: "border-pink-100",    text: "text-pink-600"    },
  { bg: "from-indigo-400 to-indigo-700", light: "bg-indigo-50",  border: "border-indigo-100",  text: "text-indigo-600"  },
]

const ICONS = ["🛋️","🍳","🛏️","🚿","🚪","💻","📦","🪴","🧺","🪑","🛁","🚗","📚","🎮","🪞","🗄️","🔑","🪣","🧰","🖼️"]

const BLANK_FORM = { name: "", description: "", tags: "", icon: "🛋️", colorIdx: 0 }

export default function Inventaire() {
  const { data, addRoom, deleteRoom, addZone, updateZone, deleteZone, addItem, updateItem, deleteItem } = useStore()
  const [view,    setView]   = useState<View>({ type: "rooms" })
  const [sheet,   setSheet]  = useState<SheetMode>(null)
  const [confirm, setConfirm]= useState<{ type: "room"|"zone"|"item"; id: string } | null>(null)
  const [form,    setForm]   = useState(BLANK_FORM)

  const zonesOf    = (room_id: string) => data.zones.filter(z => z.room_id === room_id)
  const itemsOf    = (zone_id: string) => data.items.filter(i => i.zone_id === zone_id)
  const gOf        = (idx: number)     => GRADIENTS[idx % GRADIENTS.length]
  const roomGrad   = (room: Room)      => gOf(data.rooms.findIndex(r => r.id === room.id))

  function openSheet(mode: SheetMode) {
    if (mode?.kind === "edit-item") {
      const i = mode.item
      setForm({ name: i.name, description: i.description ?? "", tags: i.tags.join(", "), icon: "📦", colorIdx: 0 })
    } else if (mode?.kind === "edit-zone") {
      setForm({ ...BLANK_FORM, name: mode.zone.name })
    } else {
      setForm(BLANK_FORM)
    }
    setSheet(mode)
  }

  function submit() {
    if (!form.name.trim()) return
    const name = form.name.trim()

    if (sheet?.kind === "add-room") {
      const g = gOf(form.colorIdx)
      addRoom({ name, icon: form.icon, color: g.light })
      toast.success(`Pièce « ${name} » ajoutée`)
    }
    if (sheet?.kind === "add-zone") {
      addZone({ name, room_id: sheet.room.id })
      toast.success(`Zone « ${name} » ajoutée`)
    }
    if (sheet?.kind === "add-item" ) {
      addItem({ name, zone_id: sheet.zone.id, description: form.description || undefined, tags: parseTags(form.tags) })
      toast.success(`« ${name} » ajouté`)
    }
    if (sheet?.kind === "edit-item") {
      updateItem(sheet.item.id, { name, description: form.description || undefined, tags: parseTags(form.tags) })
      toast.success("Objet mis à jour")
    }
    if (sheet?.kind === "edit-zone") {
      updateZone(sheet.zone.id, { name })
      toast.success("Zone renommée")
    }
    setSheet(null)
  }

  function parseTags(raw: string) {
    return raw.split(",").map(t => t.trim()).filter(Boolean)
  }

  function confirmDelete() {
    if (!confirm) return
    if (confirm.type === "room") { deleteRoom(confirm.id);  toast.success("Pièce supprimée") }
    if (confirm.type === "zone") { deleteZone(confirm.id);  toast.success("Zone supprimée")  }
    if (confirm.type === "item") { deleteItem(confirm.id);  toast.success("Objet supprimé")  }
    setConfirm(null)
  }

  const currentRoom = view.type !== "rooms" ? view.room : null
  const g = currentRoom ? roomGrad(currentRoom) : null

  /* ─── render ─── */
  return (
    <div className="flex flex-col min-h-full">

      {/* HEADER */}
      {view.type === "rooms" ? (
        <div className="relative bg-gradient-to-br from-slate-700 to-slate-900 px-5 pt-10 pb-6 text-white overflow-hidden">
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/[0.05]" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/[0.04]" />
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em] mb-1">Votre appartement</p>
          <h1 className="text-[26px] font-bold">Inventaire</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] bg-white/10 rounded-full px-2.5 py-1 text-slate-300">{data.rooms.length} pièces</span>
            <span className="text-[11px] bg-white/10 rounded-full px-2.5 py-1 text-slate-300">{data.items.length} objets</span>
          </div>
        </div>
      ) : (
        <div className={cn("relative bg-gradient-to-br px-5 pt-10 pb-6 text-white overflow-hidden", g?.bg)}>
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-white/60 text-xs mb-3 flex-wrap">
            <button onClick={() => setView({ type: "rooms" })} className="hover:text-white transition-colors font-medium">Inventaire</button>
            {view.type === "zones" && (
              <><span className="text-white/30">›</span><span className="text-white font-semibold">{view.room.name}</span></>
            )}
            {view.type === "items" && (
              <>
                <span className="text-white/30">›</span>
                <button onClick={() => setView({ type: "zones", room: view.room })} className="hover:text-white transition-colors font-medium">{view.room.name}</button>
                <span className="text-white/30">›</span>
                <span className="text-white font-semibold">{view.zone.name}</span>
              </>
            )}
          </div>
          <h1 className="text-[26px] font-bold flex items-center gap-2">
            <span className="text-3xl">{view.room.icon}</span>
            <span>{view.type === "zones" ? view.room.name : view.zone.name}</span>
          </h1>
          <p className="text-white/60 text-xs mt-1">
            {view.type === "zones"
              ? `${zonesOf(view.room.id).length} zones · ${zonesOf(view.room.id).reduce((n,z) => n + itemsOf(z.id).length, 0)} objets`
              : `${view.room.name} · ${itemsOf(view.zone.id).length} objet${itemsOf(view.zone.id).length !== 1 ? "s" : ""}`}
          </p>
        </div>
      )}

      <div className="flex-1 px-4 pt-4 pb-4 space-y-3">

        {/* ── ROOMS ── */}
        {view.type === "rooms" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {data.rooms.map((room, idx) => {
                const zones = zonesOf(room.id)
                const count = zones.reduce((n, z) => n + itemsOf(z.id).length, 0)
                const gr    = gOf(idx)
                return (
                  <div key={room.id} className="relative card overflow-hidden cursor-pointer hover:shadow-md active:scale-[0.97] transition-all"
                    onClick={() => setView({ type: "zones", room })}>
                    <div className={cn("bg-gradient-to-br h-[72px] flex items-end pb-2.5 px-3 justify-between", gr.bg)}>
                      <span className="text-3xl drop-shadow-sm">{room.icon}</span>
                      {count > 0 && (
                        <span className="text-[10px] font-bold bg-black/20 text-white px-1.5 py-0.5 rounded-full mb-0.5">{count}</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-slate-700 text-sm truncate">{room.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{zones.length} zone{zones.length !== 1 ? "s" : ""}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setConfirm({ type: "room", id: room.id }) }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/10 backdrop-blur flex items-center justify-center hover:bg-white/90 transition-colors group"
                    ><Trash2 size={11} className="text-white group-hover:text-red-500 transition-colors" /></button>
                  </div>
                )
              })}
            </div>
            <AddButton label="Ajouter une pièce" onClick={() => openSheet({ kind: "add-room" })} />
          </>
        )}

        {/* ── ZONES ── */}
        {view.type === "zones" && (
          <>
            {zonesOf(view.room.id).map(zone => {
              const count = itemsOf(zone.id).length
              const gr    = roomGrad(view.room)
              return (
                <div key={zone.id} className="card flex items-center gap-3 p-4 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all"
                  onClick={() => setView({ type: "items", room: view.room, zone })}>
                  <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center shrink-0", gr.light, gr.border)}>
                    <FolderOpen size={19} className={gr.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-700 text-sm">{zone.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{count} objet{count !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={e => { e.stopPropagation(); openSheet({ kind: "edit-zone", zone }) }}
                      className="p-1.5 text-slate-300 hover:text-indigo-400 hover:bg-indigo-50 rounded-xl transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setConfirm({ type: "zone", id: zone.id }) }}
                      className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight size={16} className="text-slate-300 ml-0.5" />
                  </div>
                </div>
              )
            })}
            {zonesOf(view.room.id).length === 0 && <EmptyState icon={<BoxSelect size={28} strokeWidth={1.2} />} title="Aucune zone" sub="Ajoutez un placard, tiroir, étagère…" />}
            <AddButton label="Ajouter une zone" onClick={() => openSheet({ kind: "add-zone", room: view.room })} />
          </>
        )}

        {/* ── ITEMS ── */}
        {view.type === "items" && (
          <>
            {itemsOf(view.zone.id).map(item => (
              <div key={item.id} className="card flex items-start gap-3 p-4 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => openSheet({ kind: "edit-item", item })}>
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Package size={17} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-700 text-sm">{item.name}</p>
                  {item.description && <p className="text-xs text-slate-400 mt-0.5 italic">{item.description}</p>}
                  {item.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Pencil size={13} className="text-slate-300" />
                  <button onClick={e => { e.stopPropagation(); setConfirm({ type: "item", id: item.id }) }}
                    className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {itemsOf(view.zone.id).length === 0 && <EmptyState icon={<Package size={28} strokeWidth={1.2} />} title="Zone vide" sub="Ajoutez vos premiers objets ici" />}
            <AddButton label="Ajouter un objet" onClick={() => openSheet({ kind: "add-item", room: view.room, zone: view.zone })} />
          </>
        )}
      </div>

      {/* ── DELETE CONFIRM ── */}
      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent className="max-w-xs mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {confirm?.type === "room" && "Supprimer cette pièce ?"}
              {confirm?.type === "zone" && "Supprimer cette zone ?"}
              {confirm?.type === "item" && "Supprimer cet objet ?"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            {confirm?.type === "room" && "Toutes les zones et tâches liées seront supprimées. Action irréversible."}
            {confirm?.type === "zone" && "Les objets de cette zone deviendront non-localisés."}
            {confirm?.type === "item" && "Cet objet sera retiré de l'inventaire."}
          </p>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setConfirm(null)}>Annuler</Button>
            <Button className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white" onClick={confirmDelete}>Supprimer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── ADD / EDIT SHEET ── */}
      <Sheet open={!!sheet} onOpenChange={open => !open && setSheet(null)}>
        <SheetContent side="bottom" className="rounded-t-[24px] px-5 pb-8 max-h-[90vh] overflow-y-auto">
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 mt-1" />
          <SheetHeader className="mb-4">
            <SheetTitle className="text-lg font-bold text-left">
              {sheet?.kind === "add-room"  && "Nouvelle pièce"}
              {sheet?.kind === "add-zone"  && "Nouvelle zone"}
              {sheet?.kind === "add-item"  && "Nouvel objet"}
              {sheet?.kind === "edit-item" && "Modifier l'objet"}
              {sheet?.kind === "edit-zone" && "Renommer la zone"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-3">
            <Input
              placeholder={
                sheet?.kind === "add-room"  ? "Ex : Salon, Chambre, Cave…" :
                sheet?.kind === "add-zone"  ? "Ex : Tiroir du haut, Placard…" :
                "Nom de l'objet"
              }
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && submit()}
              className="rounded-xl h-12 text-sm font-medium"
              autoFocus
            />

            {/* Icon + color pickers for rooms */}
            {sheet?.kind === "add-room" && (
              <>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Icône</p>
                  <div className="grid grid-cols-10 gap-1.5">
                    {ICONS.map(icon => (
                      <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                        className={cn("w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all",
                          form.icon === icon ? "bg-indigo-100 ring-2 ring-indigo-400 scale-110" : "bg-slate-50 hover:bg-slate-100"
                        )}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Couleur</p>
                  <div className="flex gap-2 flex-wrap">
                    {GRADIENTS.map((gr, i) => (
                      <button key={i} onClick={() => setForm(f => ({ ...f, colorIdx: i }))}
                        className={cn(`w-8 h-8 rounded-xl bg-gradient-to-br ${gr.bg} transition-all`,
                          form.colorIdx === i ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""
                        )} />
                    ))}
                  </div>
                </div>
                {/* Preview */}
                {form.name && (
                  <div className={cn("flex items-center gap-3 p-3 rounded-xl border", gOf(form.colorIdx).light, gOf(form.colorIdx).border)}>
                    <span className="text-2xl">{form.icon}</span>
                    <p className="font-bold text-slate-700 text-sm">{form.name}</p>
                  </div>
                )}
              </>
            )}

            {/* Item fields */}
            {(sheet?.kind === "add-item" || sheet?.kind === "edit-item") && (
              <>
                <Input placeholder="Description (optionnel)" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="rounded-xl h-12 text-sm" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tags</p>
                  <Input placeholder="documents, important, outils…" value={form.tags}
                    onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    className="rounded-xl h-12 text-sm" />
                  {form.tags && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {parseTags(form.tags).map(t => (
                        <span key={t} className="text-[10px] font-bold bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <Button
              className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm mt-1"
              onClick={submit}
              disabled={!form.name.trim()}
            >
              {sheet?.kind?.startsWith("edit") ? "Enregistrer" : "Ajouter"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors active:scale-[0.98]">
      <Plus size={18} /><span className="text-sm font-bold">{label}</span>
    </button>
  )
}

function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center py-12 gap-3 text-slate-400">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">{icon}</div>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-500">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}
