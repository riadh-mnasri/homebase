"use client"

import { useState } from "react"
import { useStore, daysOverdue } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, Circle, Plus, Trash2, AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const FREQUENCIES = [
  { label: "Quotidien", days: 1 },
  { label: "Tous les 3 jours", days: 3 },
  { label: "Hebdo", days: 7 },
  { label: "Toutes les 2 sem.", days: 14 },
  { label: "Mensuel", days: 30 },
]

export default function Menage() {
  const { data, addTask, markTaskDone, deleteTask } = useStore()
  const [dialog, setDialog] = useState(false)
  const [form, setForm] = useState({ name: "", room_id: "", frequency_days: 7 })

  const tasks = data.tasks.map(t => ({
    task: t,
    overdue: daysOverdue(t),
    room: data.rooms.find(r => r.id === t.room_id),
  })).sort((a, b) => b.overdue - a.overdue)

  const overdueCount = tasks.filter(t => t.overdue > 0).length

  function getDaysLabel(task: { task: { last_done_at: string | null; frequency_days: number }; overdue: number }) {
    if (!task.task.last_done_at) return "Jamais fait"
    if (task.overdue > 0) return `Retard de ${task.overdue} jour${task.overdue > 1 ? "s" : ""}`
    const daysLeft = task.task.frequency_days - Math.floor((Date.now() - new Date(task.task.last_done_at).getTime()) / 86400000)
    if (daysLeft === 0) return "À faire aujourd'hui"
    return `Dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`
  }

  function submit() {
    if (!form.name.trim() || !form.room_id) return
    addTask({ name: form.name, room_id: form.room_id, frequency_days: form.frequency_days, last_done_at: null })
    setForm({ name: "", room_id: "", frequency_days: 7 })
    setDialog(false)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="pt-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ménage</h1>
          {overdueCount > 0 ? (
            <p className="text-sm text-red-500 mt-0.5 flex items-center gap-1">
              <AlertCircle size={13} /> {overdueCount} tâche{overdueCount > 1 ? "s" : ""} en retard
            </p>
          ) : (
            <p className="text-sm text-green-500 mt-0.5">Tout est à jour ✓</p>
          )}
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setDialog(true)}>
          <Plus size={15} className="mr-1" /> Tâche
        </Button>
      </div>

      <div className="space-y-2">
        {tasks.map(({ task, overdue, room }) => {
          const done = overdue <= 0 && task.last_done_at !== null
          return (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                overdue > 0 ? "bg-red-50 border-red-100" : done ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"
              )}
            >
              <button onClick={() => markTaskDone(task.id)} className="shrink-0">
                {done ? (
                  <CheckCircle2 size={20} className="text-green-500" />
                ) : (
                  <Circle size={20} className={overdue > 0 ? "text-red-300" : "text-gray-300"} />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", done ? "text-gray-400 line-through" : "text-gray-800")}>
                  {task.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{room?.icon} {room?.name}</span>
                  <span className="text-gray-200">·</span>
                  <span className={cn("text-xs flex items-center gap-0.5",
                    overdue > 0 ? "text-red-500 font-medium" : done ? "text-green-500" : "text-gray-400"
                  )}>
                    <Clock size={11} />
                    {getDaysLabel({ task, overdue })}
                  </span>
                </div>
              </div>
              <button onClick={() => deleteTask(task.id)} className="p-1 text-gray-200 hover:text-red-400 transition-colors shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}

        {tasks.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10">Aucune tâche. Ajoutez votre première routine.</p>
        )}
      </div>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle tâche</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              placeholder="Ex: Passer l'aspirateur"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <select
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white text-gray-700"
              value={form.room_id}
              onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))}
            >
              <option value="">Choisir une pièce</option>
              {data.rooms.map(r => <option key={r.id} value={r.id}>{r.icon} {r.name}</option>)}
            </select>
            <div>
              <p className="text-xs text-gray-400 mb-2">Fréquence</p>
              <div className="flex flex-wrap gap-2">
                {FREQUENCIES.map(f => (
                  <button
                    key={f.days}
                    onClick={() => setForm(fm => ({ ...fm, frequency_days: f.days }))}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                      form.frequency_days === f.days
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={submit}>
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
