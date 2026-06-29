"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { AppData, Room, Zone, Item, Task } from "@/types"

const SEED: AppData = {
  rooms: [
    { id: "r1", name: "Salon", icon: "🛋️", color: "bg-blue-50 border-blue-200" },
    { id: "r2", name: "Cuisine", icon: "🍳", color: "bg-orange-50 border-orange-200" },
    { id: "r3", name: "Chambre", icon: "🛏️", color: "bg-purple-50 border-purple-200" },
    { id: "r4", name: "Salle de bain", icon: "🚿", color: "bg-cyan-50 border-cyan-200" },
    { id: "r5", name: "Entrée", icon: "🚪", color: "bg-green-50 border-green-200" },
    { id: "r6", name: "Bureau", icon: "💻", color: "bg-yellow-50 border-yellow-200" },
  ],
  zones: [
    { id: "z1", room_id: "r1", name: "Meuble TV" },
    { id: "z2", room_id: "r1", name: "Bibliothèque" },
    { id: "z3", room_id: "r2", name: "Placard haut" },
    { id: "z4", room_id: "r2", name: "Tiroir couverts" },
    { id: "z5", room_id: "r3", name: "Armoire" },
    { id: "z6", room_id: "r3", name: "Tiroir de nuit" },
    { id: "z7", room_id: "r4", name: "Armoire pharmacie" },
    { id: "z8", room_id: "r5", name: "Placard entrée" },
    { id: "z9", room_id: "r6", name: "Bureau" },
    { id: "z10", room_id: "r6", name: "Tiroir du bas" },
  ],
  items: [
    { id: "i1", zone_id: "z6", name: "Passeport", tags: ["documents", "important"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "i2", zone_id: "z8", name: "Tournevis", tags: ["outils"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "i3", zone_id: "z3", name: "Aspirine", tags: ["santé"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "i4", zone_id: "z9", name: "Chargeur MacBook", tags: ["électronique"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "i5", zone_id: "z2", name: "Livre Atomic Habits", tags: ["livres"], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  tasks: [
    { id: "t1", room_id: "r1", name: "Passer l'aspirateur", frequency_days: 7, last_done_at: new Date(Date.now() - 9 * 86400000).toISOString() },
    { id: "t2", room_id: "r4", name: "Nettoyer la douche", frequency_days: 7, last_done_at: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: "t3", room_id: "r2", name: "Nettoyer le four", frequency_days: 30, last_done_at: new Date(Date.now() - 35 * 86400000).toISOString() },
    { id: "t4", room_id: "r1", name: "Dépoussiérer les meubles", frequency_days: 14, last_done_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: "t5", room_id: "r4", name: "Nettoyer les toilettes", frequency_days: 5, last_done_at: new Date(Date.now() - 6 * 86400000).toISOString() },
    { id: "t6", room_id: "r2", name: "Vider le frigo / vieux aliments", frequency_days: 7, last_done_at: null },
  ],
}

type StoreContextType = {
  data: AppData
  addRoom: (room: Omit<Room, "id">) => void
  updateRoom: (id: string, patch: Partial<Room>) => void
  deleteRoom: (id: string) => void
  addZone: (zone: Omit<Zone, "id">) => void
  deleteZone: (id: string) => void
  addItem: (item: Omit<Item, "id" | "created_at" | "updated_at">) => void
  updateItem: (id: string, patch: Partial<Item>) => void
  deleteItem: (id: string) => void
  addTask: (task: Omit<Task, "id">) => void
  markTaskDone: (id: string) => void
  deleteTask: (id: string) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(SEED)

  useEffect(() => {
    const saved = localStorage.getItem("homebase-data")
    if (saved) {
      try { setData(JSON.parse(saved)) } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("homebase-data", JSON.stringify(data))
  }, [data])

  const addRoom = (room: Omit<Room, "id">) =>
    setData(d => ({ ...d, rooms: [...d.rooms, { ...room, id: uid() }] }))

  const updateRoom = (id: string, patch: Partial<Room>) =>
    setData(d => ({ ...d, rooms: d.rooms.map(r => r.id === id ? { ...r, ...patch } : r) }))

  const deleteRoom = (id: string) =>
    setData(d => ({
      ...d,
      rooms: d.rooms.filter(r => r.id !== id),
      zones: d.zones.filter(z => z.room_id !== id),
      tasks: d.tasks.filter(t => t.room_id !== id),
    }))

  const addZone = (zone: Omit<Zone, "id">) =>
    setData(d => ({ ...d, zones: [...d.zones, { ...zone, id: uid() }] }))

  const deleteZone = (id: string) =>
    setData(d => ({
      ...d,
      zones: d.zones.filter(z => z.id !== id),
      items: d.items.map(i => i.zone_id === id ? { ...i, zone_id: null } : i),
    }))

  const addItem = (item: Omit<Item, "id" | "created_at" | "updated_at">) => {
    const now = new Date().toISOString()
    setData(d => ({ ...d, items: [...d.items, { ...item, id: uid(), created_at: now, updated_at: now }] }))
  }

  const updateItem = (id: string, patch: Partial<Item>) =>
    setData(d => ({
      ...d,
      items: d.items.map(i => i.id === id ? { ...i, ...patch, updated_at: new Date().toISOString() } : i),
    }))

  const deleteItem = (id: string) =>
    setData(d => ({ ...d, items: d.items.filter(i => i.id !== id) }))

  const addTask = (task: Omit<Task, "id">) =>
    setData(d => ({ ...d, tasks: [...d.tasks, { ...task, id: uid() }] }))

  const markTaskDone = (id: string) =>
    setData(d => ({
      ...d,
      tasks: d.tasks.map(t => t.id === id ? { ...t, last_done_at: new Date().toISOString() } : t),
    }))

  const deleteTask = (id: string) =>
    setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }))

  return (
    <StoreContext.Provider value={{ data, addRoom, updateRoom, deleteRoom, addZone, deleteZone, addItem, updateItem, deleteItem, addTask, markTaskDone, deleteTask }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used inside StoreProvider")
  return ctx
}

export function daysOverdue(task: Task): number {
  if (!task.last_done_at) return task.frequency_days
  const diff = (Date.now() - new Date(task.last_done_at).getTime()) / 86400000
  return Math.floor(diff - task.frequency_days)
}
