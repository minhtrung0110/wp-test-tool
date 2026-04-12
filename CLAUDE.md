# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WP Test Tool is an Electron desktop app for WordPress developers to test CSS/layout changes across multiple pages after code merges. It embeds a browser (WebContentsView) for previewing local WordPress pages, tracking test state, taking screenshots, and exporting reports.

## Commands

```bash
# Development (hot reload)
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Format
npm run format

# Build for current platform
npm run build

# Platform-specific builds
npm run build:win    # Windows NSIS installer → dist/
npm run build:mac    # macOS DMG → dist/
npm run build:linux  # Linux AppImage → dist/
```

There are no automated tests configured yet.

## Architecture

This is an Electron app using the standard **main / preload / renderer** split. Vite (via `electron-vite`) bundles all three targets independently.

```
src/
  main/       – Electron main process (Node.js context)
    index.ts  – Window lifecycle, BrowserWindow + WebContentsView layout
    ipc.ts    – IPC handlers (store read/write)
    store.ts  – electron-store setup for JSON persistence
  preload/
    index.ts  – Context bridge: exposes window.api and window.electron to renderer
  renderer/
    src/
      App.tsx       – Root layout component (sidebar + main content)
      main.tsx      – React entry point
      index.css     – Tailwind v4 imports + @theme tokens + custom styles
      store/index.ts – Zustand store (all runtime app state)
```

### IPC Communication Pattern

Renderer cannot access Node.js directly. All privileged operations go through IPC:

1. **Renderer** calls `window.api.getStoreValue(key)` / `window.api.setStoreValue(key, value)`
2. **Preload** (`contextBridge`) forwards these as IPC messages
3. **Main** (`ipc.ts`) handles them and interacts with `electron-store`

When adding new main-process capabilities, add an IPC handler in `src/main/ipc.ts` and expose it via `contextBridge` in `src/preload/index.ts`.

### WebContentsView

Page previews use `WebContentsView` (not the deprecated `<webview>` tag). The view is created in `src/main/index.ts` and positioned programmatically. The sidebar is fixed at 300px; the view occupies the remaining width. Resizing the window requires updating the view bounds via `view.setBounds()`.

### State Management

- **Runtime state** (current URL, selected page, test statuses, etc.): Zustand store in `src/renderer/src/store/index.ts`
- **Persisted state** (domain, pages, categories, theme, windowBounds): `electron-store` via IPC, stored as JSON on the user's filesystem

### Styling

Tailwind CSS v4 — uses the new `@import "tailwindcss"` syntax and `@theme {}` blocks in `index.css` (not a `tailwind.config.js`). The design system follows the "Architectural Console" aesthetic defined in `DESIGN.md`: dark by default, slate-900/slate-800 backgrounds, blue primary (#004ac6), no 1px borders (use background shifts instead), glassmorphism for floating elements.

### TypeScript Config

Three tsconfig files:
- `tsconfig.json` — base (path alias `@renderer/*`)
- `tsconfig.node.json` — main + preload processes
- `tsconfig.web.json` — renderer (React)

Strict mode is enabled. Run `npm run typecheck` to validate all three.

## Key Reference Files

- `DESIGN.md` — Design system tokens, typography, component rules, do's/don'ts
- `PRD.md` — Full product requirements (Vietnamese), feature specs, data schema, planned keyboard shortcuts
- `vietnambooking-pages.json` — Sample data with 63 test pages (gitignored, for local dev)
