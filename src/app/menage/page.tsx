"use client"

import { useState } from "react"
import { useStore, daysOverdue } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, Circle, Plus, Trash2, Clock, Sparkles, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

const FREQUENCIES = [
  { label: "Quotidien", days: 1 },
  { label: "3 jours", days: 3 },
  { label: "Hebdo", days: 7 },
  { label: "2 semaines", days: 14 },
  { label: "Mensuel", days: 30 },
]

type TaskGroup = "overdue" | "today" | "ok"

export default function Menage() {
  const { data, addTask, markTaskDone, deleteTask } = useStore()
  const [dialog, setDialog] = useState(false)
  const [form, setForm] = useState({ name: "", room_id: "", frequency_days: 7 })

  const enriched = data.tasks.map(t => ({
    task: t,
    overdue: daysOverdue(t),
    room: data.rooms.find(r => r.id === t.room_id),
  }))

  const overdueItems = enriched.filter(t => t.overdue > 0).sort((a, b) => b.overdue - a.overdue)
  const todayItems = enriched.filter(t => t.overdue === 0 && t.task.last_done_at !== null)
  const neverItems = enriched.filter(t => !t.task.last_done_at)
  const okItems = enriched.filter(t => t.overdue < 0)

  const doneCount = okItems.length
  const total = data.tasks.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  function getDaysLabel(task: { last_done_at: string | null; frequency_days: number }, overdue: number) {
    if (!task.last_done_at) return "Jamais fait"
    if (overdue > 0) return `${overdue}j de retard`
    const daysLeft = task.frequency_days - Math.floor((Date.now() - new Date(task.last_done_at).getTime()) / 86400000)
    if (daysLeft <= 0) return "Aujourd'hui"
    return `Dans ${daysLeft}j`
  }

  function submit() {
    if (!form.name.trim() || !form.room_id) return
    addTask({ name: form.name, room_id: form.room_id, frequency_days: form.frequency_days, last_done_at: null })
    setForm({ name: "", room_id: "", frequency_days: 7 })
    setDialog(false)
  }

  const TaskCard = ({ task, overdue, room }: typeof enriched[0]) => {
    const done = overdue < 0 && task.last_done_at !== null
    const urgency = overdue >= 7 ? "high" : overdue >= 3 ? "mid" : overdue > 0 ? "low" : "ok"
    const never = !task.last_done_at

    return (
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-2xl border transition-all",
        never ? "bg-slate-50 border-slate-100" :
        urgency === "high" ? "bg-red-50 border-red-100" :
        urgency === "mid" ? "bg-orange-50 border-orange-100" :
        urgency === "low" ? "bg-amber-50 border-amber-100" :
        done ? "bg-white border-slate-100 opacity-60" :
        "bg-white border-slate-100"
      )}>
        <button
          onClick={() => markTaskDone(task.id)}
          className="shrink-0 transition-transform active:scale-90"
        >
          {done ? (
            <CheckCircle2 size={22} className="text-green-400" />
          ) : (
            <Circle size={22} className={cn(
              never ? "text-slate-300" :
              urgency === "high" ? "text-red-300" :
              urgency === "mid" ? "text-orange-300" :
              urgency === "low" ? "text-amber-300" :
              "text-slate-300"
            )} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold truncate", done ? "text-slate-400 line-through" : "text-slate-700")}>
            {task.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-slate-400">{room?.icon} {room?.name}</span>
            <span className="text-slate-200 text-xs">·</span>
            <span className={cn("text-xs font-medium flex items-center gap-0.5",
              never ? "text-slate-400" :
              urgency === "high" ? "text-red-500" :
              urgency === "mid" ? "text-orange-500" :
              urgency === "low" ? "text-amber-600" :
              done ? "text-green-500" : "text-slate-400"
            )}>
              <Clock size={10} />
              {getDaysLabel(task, overdue)}
            </span>
          </div>
        </div>

        <button
          onClick={() => deleteTask(task.id)}
          className="p-1.5 text-slate-200 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className={cn(
        "px-5 pt-10 pb-6 text-white bg-gradient-to-br",
        overdueItems.length > 0 ? "from-orange-500 to-red-500" : "from-emerald-500 to-teal-600"
      )}>
        <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">Routines</p>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ménage</h1>
            {overdueItems.length > 0 ? (
              <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5">
                <TriangleAlert size={13} />
                {overdueItems.length} tâche{overdueItems.length > 1 ? "s" : ""} en retard
              </p>
            ) : (
              <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5">
                <Sparkles size={13} />
                Tout est à jour
              </p>
            )}
          </div>
          <button
            onClick={() => setDialog(true)}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors px-3 py-2 rounded-xl text-white text-sm font-semibold"
          >
            <Plus size={16} /> Tâche
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/70 mb-1.5">
            <span>{doneCount} à jour sur {total}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-4 space-y-5">

        {/* Overdue */}
        {overdueItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wide">En retard · {overdueItems.length}</p>
            {overdueItems.map(t => <TaskCard key={t.task.id} {...t} />)}
          </div>
        )}

        {/* Never done */}
        {neverItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Jamais fait · {neverItems.length}</p>
            {neverItems.map(t => <TaskCard key={t.task.id} {...t} />)}
          </div>
        )}

        {/* Due today */}
        {todayItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wide">Aujourd'hui · {todayItems.length}</p>
            {todayItems.map(t => <TaskCard key={t.task.id} {...t} />)}
          </div>
        )}

        {/* OK */}
        {okItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-green-500 uppercase tracking-wide">À jour · {okItems.length}</p>
            {okItems.map(t => <TaskCard key={t.task.id} {...t} />)}
          </div>
        )}

        {data.tasks.length === 0 && (
          <div className="flex flex-col items-center py-14 gap-3 text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">🧹</div>
            <p className="text-sm font-medium">Aucune routine pour l'instant</p>
            <p className="text-xs text-center text-slate-300">Ajoutez vos premières tâches ménagères<br/>pour suivre votre planning</p>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Nouvelle tâche</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              placeholder="Ex : Passer l'aspirateur"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="rounded-xl h-11"
              autoFocus
            />
            <select
              className="w-full border border-slate-200 rounded-xl px-3 h-11 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={form.room_id}
              onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))}
            >
              <option value="">Choisir une pièce</option>
              {data.rooms.map(r => <option key={r.id} value={r.id}>{r.icon} {r.name}</option>)}
            </select>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Fréquence</p>
              <div className="grid grid-cols-3 gap-2">
                {FREQUENCIES.map(f => (
                  <button
                    key={f.days}
                    onClick={() => setForm(fm => ({ ...fm, frequency_days: f.days }))}
                    className={cn(
                      "py-2 rounded-xl text-xs font-semibold border transition-all",
                      form.frequency_days === f.days
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              onClick={submit}
              disabled={!form.name.trim() || !form.room_id}
            >
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
