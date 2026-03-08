# Focus Timer

A minimal, elegant Pomodoro-style focus timer built with Vite and React.

## Features

- **Three presets** — Focus (25 min), Short Break (5 min), Long Break (15 min)
- **Animated ring progress** — smooth SVG arc that tracks time remaining
- **Ambient glow** — subtle radial gradient that shifts with each preset
- **Completion overlay** — celebrates the end of each session and auto-advances to the next preset
- **Keyboard shortcut** — press `Space` to start or pause without touching the mouse
- **Accessible** — ARIA live regions, labelled controls, and full focus-visible states
- **Reduced-motion safe** — all animations are disabled when the OS preference is set

## Stack

- [Vite](https://vitejs.dev/) — lightning-fast dev server and build tool
- [React 18](https://react.dev/) — UI with hooks (`useState`, `useEffect`, `useCallback`, `useRef`)
- [DM Mono](https://fonts.google.com/specimen/DM+Mono) + [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) — typography via Google Fonts

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build & Deploy

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build locally
```

The project is configured to deploy automatically to GitHub Pages via GitHub Actions on every push to `main`.

## Live Demo

[mvareva.github.io/focus-timer](https://mvareva.github.io/focus-timer)
