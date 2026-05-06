# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KPI Management System — a React + Vite SPA for tracking and managing KPIs. All application code lives under `frontend/`.

## Commands

Run from the `frontend/` directory:

```bash
npm run dev       # Start dev server (Vite)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint
```

## Architecture

**Tech stack:** React 19, Vite 8, Bootstrap 5, React Bootstrap

**Key conventions (from project README):**
- New pages → `frontend/src/pages/`
- Reusable components (e.g. Sidebar) → `frontend/src/component/`
- All theming via CSS variables in `frontend/src/styles/theme.css` — use these variables everywhere to stay consistent

**Theme variables** (defined in `theme.css`):
- Colors: `--sidebar-bg`, `--main-bg`, `--accent-orange`, `--card-bg`, `--text-main`, `--text-muted`
- Layout: `--sidebar-width: 260px`
- Border radius: `--radius-lg: 20px`, `--radius-md: 12px`
- Fonts: `--font-heading` (Playfair Display, serif), `--font-body` (Inter, sans-serif)

**Layout pattern:** Pages use a fixed `<Sidebar>` (260px wide) + a `<main>` with `marginLeft: var(--sidebar-width)`. See `Dashboard.jsx` for the reference implementation.

**Entry point:** `App.jsx` renders a single page component directly — routing is not yet set up.
