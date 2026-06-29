export type Room = {
  id: string
  name: string
  icon: string
  color: string
}

export type Zone = {
  id: string
  room_id: string
  name: string
}

export type Item = {
  id: string
  zone_id: string | null
  name: string
  description?: string
  tags: string[]
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  room_id: string
  name: string
  frequency_days: number
  last_done_at: string | null
}

export type AppData = {
  rooms: Room[]
  zones: Zone[]
  items: Item[]
  tasks: Task[]
}
