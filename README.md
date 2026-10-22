# Work Study

Mobile-first app for standardized work: work elements, a general library, sequences, processes,
portfolios (seasonal staffing), value stream maps (VSM) and analysis. No backend and no build step:
it is a static site. All data is saved in the browser (localStorage) on each device.

## Folder structure

```
work-study/
├── index.html              The whole app (React + htm, inline code and styles)
├── manifest.webmanifest    Makes it installable (name, colors, icons)
├── sw.js                   Service worker: offline support
├── vercel.json             Vercel settings (static site, service worker headers)
├── .gitignore
├── README.md               This file
├── vendor/                 React, ReactDOM and htm (local copies so it works offline)
│   ├── react.production.min.js
│   ├── react-dom.production.min.js
│   ├── htm.umd.js
│   └── LICENSE-*.txt
├── icons/                  App icons (replace with your own, keep the file names)
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-512.png
│   ├── apple-touch-icon.png
│   └── favicon-32.png
└── most-card/              Optional: your MOST data card images (see most-card/README.txt)
    ├── cards.json
    └── README.txt
```

## Run locally

Service workers need http, so do not just double-click index.html. From this folder:

```
python3 -m http.server 8080
# or: npx serve .
```

Open http://localhost:8080

## Put it on GitHub

```
cd work-study
git init
git add .
git commit -m "Work Study app"
git branch -M main
git remote add origin https://github.com/<you>/work-study.git
git push -u origin main
```

Use a **private** repository if you add MOST card images (see below).

## Deploy on Vercel

1. vercel.com > Add New > Project > import the GitHub repo.
2. Framework Preset: **Other**. Build Command: leave empty. Output Directory: leave empty (project root).
3. Deploy. Every push to `main` redeploys.

### If Vercel says `vite: command not found` / `vite build exited with 127`

This app has no build step. Vercel is running a build because the project is set to the Vite preset.
- vercel.json in this folder now forces "no framework, no build". Push it and redeploy.
- Also check Project > Settings > Build and Development Settings: Framework Preset = **Other**, and turn
  off the Override for Build Command, Install Command and Output Directory (or clear them).
- Make sure there is no package.json in the repo root with a "build": "vite build" script (for example
  from another project in the same repo).
- Make sure Settings > General > **Root Directory** points at the folder that contains index.html
  (if you pushed the whole `work-study` folder inside a repo, set Root Directory to `work-study`).

## Install as an app

Open the deployed URL on a phone: Share > Add to Home Screen (iOS) or Install app (Android/Chrome).
After the first load it works offline.

## Updating

Edit index.html, then change `CACHE_VERSION` in sw.js (for example `workstudy-v2`) before you push, so
installed copies pick up the new version. Reload twice on a device to see the update.

## Your data

Data lives only in each browser or device. Use Settings > Export JSON to back it up, and Settings > Import
to restore or move data to another device. Clearing browser data erases it.

## MOST card and tables

- Tapping a letter in the MOST section opens lookup tables that are written into index.html
  (transcribed from a BasicMOST data card). Anyone who can open the site can see them.
- The card images themselves are separate. Users can add them in the app ("MOST card" button > + Add image;
  stored only on that device), or you can ship them with the site in `most-card/`.

## Changing the app icon

Replace the PNG files in `icons/` with your own artwork at the same sizes and file names:
192x192, 512x512, a 512x512 maskable version (keep the artwork inside the central 60%),
180x180 for Apple and 32x32 for the browser tab.

## Licenses

React and htm are bundled under their own licenses (see vendor/LICENSE-*.txt).
The BasicMOST data card is the property of its owner; confirm you are licensed to use and share it.
