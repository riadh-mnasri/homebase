"use client"

import { useState } from "react"
import { useStore, daysOverdue, nextDueLabel } from "@/lib/store"
import { Task } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { CheckCircle2, Circle, Plus, Trash2, Pencil, Clock, Sparkles, TriangleAlert, ChevronsUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const FREQUENCIES = [
  { label: "Quotidien",  days: 1  },
  { label: "3 jours",    days: 3  },
  { label: "Hebdo",      days: 7  },
  { label: "2 semaines", days: 14 },
  { label: "Mensuel",    days: 30 },
]

type SheetMode = { kind: "add" } | { kind: "edit"; task: Task } | null

const BLANK = { name: "", room_id: "", frequency_days: 7 }

export default function Menage() {
  const { data, addTask, updateTask, markTaskDone, deleteTask } = useStore()
  const [sheet, setSheet] = useState<SheetMode>(null)
  const [form,  setForm]  = useState(BLANK)

  const enriched = data.tasks.map(t => ({
    task: t, overdue: daysOverdue(t), room: data.rooms.find(r => r.id === t.room_id),
  }))

  const overdueGroup = enriched.filter(t => t.overdue > 0).sort((a, b) => b.overdue - a.overdue)
  const neverGroup   = enriched.filter(t => !t.task.last_done_at)
  const okGroup      = enriched.filter(t => t.overdue < 0 && t.task.last_done_at)
  const todayGroup   = enriched.filter(t => t.overdue === 0 && t.task.last_done_at)

  const doneCount = okGroup.length
  const total     = data.tasks.length
  const pct       = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const allGood   = overdueGroup.length === 0

  function openAdd() { setForm(BLANK); setSheet({ kind: "add" }) }
  function openEdit(task: Task) {
    setForm({ name: task.name, room_id: task.room_id, frequency_days: task.frequency_days })
    setSheet({ kind: "edit", task })
  }

  function submit() {
    if (!form.name.trim() || !form.room_id) return
    const name = form.name.trim()
    if (sheet?.kind === "add") {
      addTask({ name, room_id: form.room_id, frequency_days: form.frequency_days, last_done_at: null })
      toast.success(`Tâche « ${name} » ajoutée`)
    }
    if (sheet?.kind === "edit") {
      updateTask(sheet.task.id, { name, room_id: form.room_id, frequency_days: form.frequency_days })
      toast.success("Tâche mise à jour")
    }
    setSheet(null)
  }

  function handleMarkDone(id: string, name: string) {
    markTaskDone(id)
    toast.success(`✓ ${name}`)
  }

  function handleDelete(id: string) {
    deleteTask(id)
    toast.success("Tâche supprimée")
  }

  function markAllOverdueDone() {
    overdueGroup.forEach(({ task }) => markTaskDone(task.id))
    toast.success(`${overdueGroup.length} tâche${overdueGroup.length > 1 ? "s" : ""} marquée${overdueGroup.length > 1 ? "s" : ""} ✓`)
  }

  /* ── Task card component ── */
  const TaskCard = ({ task, overdue, room }: typeof enriched[0]) => {
    const done    = overdue < 0 && !!task.last_done_at
    const never   = !task.last_done_at
    const urgency = overdue >= 7 ? "high" : overdue >= 3 ? "mid" : overdue > 0 ? "low" : "ok"

    const borderColor =
      never   ? "border-slate-100"   :
      urgency === "high" ? "border-red-200"    :
      urgency === "mid"  ? "border-orange-200" :
      urgency === "low"  ? "border-amber-200"  : "border-slate-100"

    const leftBar =
      never   ? "bg-slate-300"    :
      urgency === "high" ? "bg-red-400"    :
      urgency === "mid"  ? "bg-orange-400" :
      urgency === "low"  ? "bg-amber-400"  : "bg-emerald-400"

    const timeBadgeStyle =
      never   ? "text-slate-400 bg-slate-100"        :
      urgency === "high" ? "text-red-600 bg-red-100"       :
      urgency === "mid"  ? "text-orange-600 bg-orange-100" :
      urgency === "low"  ? "text-amber-700 bg-amber-100"   :
      done    ? "text-emerald-600 bg-emerald-50"     : "text-slate-500 bg-slate-100"

    return (
      <div className={cn(
        "flex items-center gap-3 p-3.5 rounded-2xl border bg-white shadow-sm transition-all",
        borderColor, done ? "opacity-55" : ""
      )}>
        {/* Left urgency bar */}
        <div className={cn("w-1 self-stretch rounded-full shrink-0", leftBar)} />

        {/* Check button */}
        <button onClick={() => !done && handleMarkDone(task.id, task.name)}
          className={cn("shrink-0 transition-transform active:scale-90", done ? "cursor-default" : "")}>
          {done
            ? <CheckCircle2 size={22} className="text-emerald-400" />
            : <Circle size={22} className={cn(
                urgency === "high" ? "text-red-300" :
                urgency === "mid"  ? "text-orange-300" :
                urgency === "low"  ? "text-amber-300" : "text-slate-300"
              )} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-bold truncate", done ? "text-slate-400 line-through" : "text-slate-700")}>
            {task.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] text-slate-400">{room?.icon}&nbsp;{room?.name}</span>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5", timeBadgeStyle)}>
              <Clock size={9} />
              {nextDueLabel(task)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => openEdit(task)}
            className="p-1.5 text-slate-300 hover:text-indigo-400 hover:bg-indigo-50 rounded-xl transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => handleDelete(task.id)}
            className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    )
  }

  /* ── render ── */
  return (
    <div className="flex flex-col min-h-full">

      {/* HEADER */}
      <div className={cn(
        "relative px-5 pt-10 pb-6 text-white overflow-hidden bg-gradient-to-br",
        allGood ? "from-emerald-500 to-teal-600" : "from-orange-500 via-orange-500 to-red-500"
      )}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/[0.07]" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/[0.05]" />

        <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.1em] mb-1">Routines ménagères</p>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[26px] font-bold">Ménage</h1>
            <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5">
              {allGood ? <><Sparkles size={13} /> Tout est à jour</> : <><TriangleAlert size={13} /> {overdueGroup.length} tâche{overdueGroup.length > 1 ? "s" : ""} en retard</>}
            </p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:scale-95 transition-all px-3 py-2 rounded-xl text-white text-sm font-bold">
            <Plus size={16} /> Tâche
          </button>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/70 mb-1.5 font-medium">
            <span>{doneCount}/{total} à jour</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-4 space-y-5">

        {/* Mark all done CTA */}
        {overdueGroup.length >= 2 && (
          <button onClick={markAllOverdueDone}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 font-bold text-sm hover:bg-red-100 active:scale-[0.98] transition-all">
            <ChevronsUp size={16} />
            Tout marquer comme fait ({overdueGroup.length})
          </button>
        )}

        {/* Overdue */}
        {overdueGroup.length > 0 && (
          <TaskGroup label="En retard" labelClass="text-red-400" count={overdueGroup.length}>
            {overdueGroup.map(t => <TaskCard key={t.task.id} {...t} />)}
          </TaskGroup>
        )}

        {/* Never done */}
        {neverGroup.length > 0 && (
          <TaskGroup label="Jamais fait" labelClass="text-slate-400" count={neverGroup.length}>
            {neverGroup.map(t => <TaskCard key={t.task.id} {...t} />)}
          </TaskGroup>
        )}

        {/* Due today */}
        {todayGroup.length > 0 && (
          <TaskGroup label="Aujourd'hui" labelClass="text-amber-500" count={todayGroup.length}>
            {todayGroup.map(t => <TaskCard key={t.task.id} {...t} />)}
          </TaskGroup>
        )}

        {/* OK */}
        {okGroup.length > 0 && (
          <TaskGroup label="À jour" labelClass="text-emerald-500" count={okGroup.length}>
            {okGroup.map(t => <TaskCard key={t.task.id} {...t} />)}
          </TaskGroup>
        )}

        {total === 0 && (
          <div className="flex flex-col items-center py-14 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">🧹</div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500">Aucune routine</p>
              <p className="text-xs text-slate-400 mt-0.5">Ajoutez vos premières tâches ménagères</p>
            </div>
            <button onClick={openAdd}
              className="mt-1 flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-transform">
              <Plus size={15} /> Première tâche
            </button>
          </div>
        )}
      </div>

      {/* ── ADD / EDIT SHEET ── */}
      <Sheet open={!!sheet} onOpenChange={open => !open && setSheet(null)}>
        <SheetContent side="bottom" className="rounded-t-[24px] px-5 pb-8">
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 mt-1" />
          <SheetHeader className="mb-4">
            <SheetTitle className="text-lg font-bold text-left">
              {sheet?.kind === "add"  ? "Nouvelle tâche" : "Modifier la tâche"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-3">
            <Input
              placeholder="Ex : Passer l'aspirateur"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="rounded-xl h-12 text-sm font-medium"
              autoFocus
            />

            {/* Room picker */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pièce</p>
              <div className="flex gap-2 flex-wrap">
                {data.rooms.map(r => (
                  <button key={r.id} onClick={() => setForm(f => ({ ...f, room_id: r.id }))}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-all",
                      form.room_id === r.id
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    )}>
                    <span>{r.icon}</span><span>{r.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Fréquence</p>
              <div className="grid grid-cols-5 gap-1.5">
                {FREQUENCIES.map(f => (
                  <button key={f.days} onClick={() => setForm(fm => ({ ...fm, frequency_days: f.days }))}
                    className={cn(
                      "py-2.5 rounded-xl text-[11px] font-bold border transition-all",
                      form.frequency_days === f.days
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
                    )}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm"
              onClick={submit}
              disabled={!form.name.trim() || !form.room_id}
            >
              {sheet?.kind === "edit" ? "Enregistrer" : "Ajouter"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function TaskGroup({ label, labelClass, count, children }: {
  label: string; labelClass: string; count: number; children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <p className={cn("text-[10px] font-bold uppercase tracking-[0.08em]", labelClass)}>
        {label}&nbsp;·&nbsp;{count}
      </p>
      {children}
    </div>
  )
}
