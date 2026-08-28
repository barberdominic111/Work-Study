# VSM Simulator

A mobile-friendly Progressive Web App for building a simplified Value Stream
Map and simulating material flow through it — lead time, VA/NVA split,
throughput, WIP, and bottleneck are all computed from the process and
inventory data you enter, not hard-coded.

Everything runs client-side: no backend, no auth, no database, no external
APIs. Your work is saved to `localStorage` so closing and reopening the
browser keeps your data.

## What's in here

```
src/
  lib/
    simulationEngine.js   the simulation — pure functions, no React
    model.js               default VSM + factory helpers
    storage.js              localStorage load/save
    exportCsv.js            CSV/JSON export
    styles.js                shared inline style tokens (design system)
  components/               ProcessBox, InventoryTriangle, VA/NVA timeline, modals, tab bar
  pages/                    VSM, Simulation, Results, Scenario, Data, Settings
  theme.css                 CSS variables for Light / Warm / Dark themes
```

The **Light** theme matches the color values used in the companion TimeStudy
app (same blues, grays, status colors, spacing, and DM Mono for numbers).
Warm and Dark are derived variants that keep the same status/accent colors
so charts and utilization bars read consistently across themes. Switch
between them under **Settings**.

## How the simulation works

`src/lib/simulationEngine.js` runs a deterministic, discrete, unit-by-unit
walk of `simulationQuantity` pieces through your processes:

- Each process can have multiple parallel machines; a unit is assigned to
  whichever machine frees up earliest (a standard multi-server queue).
- Changeover/setup time is charged once every `batchSize` units on the
  process's shared line clock.
- Uptime inflates the effective cycle time (`cycleTime / uptime`).
- A unit can't start at a process until the corresponding upstream unit
  (offset by any starting inventory) has finished — this is what produces
  queueing and, when a downstream process is slower than an upstream one,
  the classic VSM lesson that a faster process just builds inventory rather
  than more throughput.

Bottleneck detection is formula-based (effective capacity = machines ×
uptime × 3600 / (cycle time + setup/batch)), so it stays stable and easy to
sanity-check independent of simulation noise. Lead time, VA time, and NVA
time are averaged over the last 20% of units simulated, to exclude the
startup transient.

## Run locally

Requires Node 18+.

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

To build a production bundle:

```bash
npm run build
npm run preview   # serve the built app locally to sanity-check it
```

## Deploy: GitHub → Vercel

1. Create a new GitHub repository and push this project:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: VSM Simulator"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com), **Add New → Project**, and import
   the GitHub repository.
3. Vercel auto-detects Vite. Confirm these settings (they're the defaults):
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**. Vercel gives you a `https://<project>.vercel.app` URL.

## Install as a PWA

Once deployed (PWA install requires HTTPS, so this won't work on
`localhost` in most browsers — use the Vercel URL):

- **iOS Safari:** Share → Add to Home Screen
- **Android Chrome:** ⋮ menu → Install app (or you'll see an install banner)
- **Desktop Chrome/Edge:** install icon in the address bar

## Known v1 limits (by design)

- The VSM visual is a straight PROCESS → INVENTORY → PROCESS chain, not a
  general drawing canvas.
- Inventory buffers don't have a hard capacity cap — they're shown building
  up when a downstream process is slower, which is the point.
- One scenario at a time (baseline + scenario). Extending to multiple named
  scenarios just means keeping an array instead of a single `scenario`
  object in `App.jsx`.
- "What if?" questions (demand +20%, remove a buffer, etc.) are answered by
  editing the relevant field on the VSM tab and re-running — there's no
  optimizer searching for the best configuration yet.
