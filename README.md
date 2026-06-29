# HomeBase 🏠

> **Organize your apartment. Find everything instantly. Stay on top of cleaning.**

HomeBase is a mobile-first PWA built for households that want to keep track of where things are stored and maintain a recurring cleaning schedule — all in one elegant, offline-capable app.

**Live demo:** [homebase-beryl.vercel.app](https://homebase-beryl.vercel.app)

---

## Features

### Inventory
- Hierarchical structure: **Room → Zone → Item** (e.g. Bedroom → Nightstand → Passport)
- Full CRUD on rooms, zones, and items
- Room icon picker (20 emojis) and color gradient picker
- Live preview when creating a room
- Rename zones inline
- Edit items (name, description, tags)
- Item count badges on room cards

### Global Search
- Search across all items by name, description, or tags
- Results show the full path: `🛏️ Bedroom › Nightstand`
- Available from the home screen — one tap, two keystrokes

### Cleaning Schedule
- Recurring tasks with configurable frequency (daily → monthly)
- Tasks grouped by status: **Overdue · Never done · Due today · Up to date**
- Urgency-coded color system (red / orange / amber / green)
- "Mark all done" shortcut when multiple tasks are overdue
- Edit any task (name, room, frequency) without deleting and recreating
- Progress bar showing `X/Y tasks up to date`

### Dashboard
- Personalized greeting with today's date
- Apartment health score (% of tasks up to date)
- Overdue task summary with urgency levels
- Room shortcuts carousel with per-room item counts
- Global stats strip (rooms, items, routines)

---

## Tech Stack

| Layer        | Choice                        | Why                                               |
|--------------|-------------------------------|---------------------------------------------------|
| Framework    | Next.js 15 (App Router)       | React Server Components, static export, PWA-ready |
| UI library   | shadcn/ui + Tailwind CSS v4   | Accessible primitives, zero lock-in               |
| Icons        | Lucide React                  | Consistent stroke icons, tree-shakeable           |
| Toasts       | Sonner                        | Lightweight, beautiful notifications              |
| State        | React Context + localStorage  | Zero backend, works offline instantly             |
| Font         | Geist (Vercel)                | Clean, legible on mobile screens                  |
| Deployment   | Vercel                        | Automatic deploys on `git push` to `main`         |

> **Supabase-ready:** `@supabase/supabase-js` and `@supabase/ssr` are already installed. Migrating from localStorage to a real database requires only updating the store layer (`src/lib/store.tsx`).

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — StoreProvider, Toaster, Nav
│   ├── globals.css         # Design tokens, base styles, utility classes
│   ├── page.tsx            # Dashboard (search, overdue, stats, room carousel)
│   ├── inventaire/
│   │   └── page.tsx        # Inventory — room grid → zone list → item list
│   └── menage/
│       └── page.tsx        # Cleaning schedule — grouped tasks, progress bar
├── components/
│   ├── Nav.tsx             # Bottom navigation bar with copyright
│   └── ui/                 # shadcn/ui components (button, input, sheet, …)
├── lib/
│   ├── store.tsx           # Global state (Context + localStorage), all CRUD ops
│   └── utils.ts            # cn() helper (clsx + tailwind-merge)
└── types/
    └── index.ts            # Room, Zone, Item, Task, AppData TypeScript types
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
git clone https://github.com/riadh-mnasri/homebase.git
cd homebase
npm install
```

### Run locally

```bash
npm run dev
# → http://localhost:3212
```

### Build for production

```bash
npm run build
npm run start
```

---

## Data Architecture

All data is persisted in **localStorage** under the key `homebase-data`. No account, no backend, no network required.

```
AppData
├── rooms[]     { id, name, icon, color }
├── zones[]     { id, room_id, name }
├── items[]     { id, zone_id, name, description, tags[], created_at, updated_at }
└── tasks[]     { id, room_id, name, frequency_days, last_done_at }
```

**Cascading deletes:**
- Deleting a **room** removes its zones, tasks, and orphans its items (`zone_id → null`)
- Deleting a **zone** orphans its items (`zone_id → null`)

**Key store functions:**

```ts
// Inventory
addRoom(room)    / updateRoom(id, patch)    / deleteRoom(id)
addZone(zone)    / updateZone(id, patch)    / deleteZone(id)
addItem(item)    / updateItem(id, patch)    / deleteItem(id)

// Cleaning
addTask(task)    / updateTask(id, patch)    / deleteTask(id)
markTaskDone(id)

// Utilities
daysOverdue(task)   // negative = on track, positive = overdue by N days
nextDueLabel(task)  // "In 3 days" | "Today" | "2 days overdue" | "Never done"
```

---

## Migrating to Supabase (optional)

The state layer is fully isolated in `src/lib/store.tsx`. To switch from localStorage to a real database:

1. Create a Supabase project and run the schema below
2. Add env vars to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Replace the `useEffect` + `localStorage` logic in `store.tsx` with Supabase queries

```sql
create table rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null, icon text, color text,
  created_at timestamptz default now()
);

create table zones (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  name text not null
);

create table items (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid references zones(id) on delete set null,
  name text not null, description text, tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  name text not null,
  frequency_days integer not null default 7,
  last_done_at timestamptz
);
```

---

## Deployment

The project is linked to Vercel via GitHub integration. Every push to `main` triggers an automatic production deployment.

Manual deploy via CLI:

```bash
npx vercel --prod
```

---

## Roadmap

- [ ] Multi-user sync (Supabase Auth + Realtime)
- [ ] Item photo capture (Supabase Storage)
- [ ] Move items between zones
- [ ] Push notifications for overdue tasks (Web Push API)
- [ ] PWA install manifest (`manifest.json`)
- [ ] Dark mode

---

## License

MIT — © 2026 [Riadh MNASRI](https://github.com/riadh-mnasri) · [WeHighTech](https://wehightech.com)
