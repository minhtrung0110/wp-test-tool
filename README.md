<div align="center">

<img src="assets/icon.png" alt="WP Test Tool" width="88" />

# WP Test Tool

**A desktop app for WordPress developers to verify CSS & layout changes across all pages after every merge — without touching a browser.**

[![Release](https://img.shields.io/github/v/release/minhtrung0110/wp-test-tool?style=flat-square&color=4d8ef5&label=release)](https://github.com/minhtrung0110/wp-test-tool/releases)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)](https://github.com/minhtrung0110/wp-test-tool/releases)
[![Electron](https://img.shields.io/badge/Electron-34-47848f?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/github/license/minhtrung0110/wp-test-tool?style=flat-square)](LICENSE)

</div>

---

## Overview

After merging CSS or layout changes to a WordPress project, manually opening each page in a browser to check for regressions is slow and error-prone. **WP Test Tool** gives you a focused, keyboard-friendly workspace: maintain a curated list of test pages, preview them in an embedded browser at any viewport width, take screenshots, write notes on issues found, and export a full test report — all from a single window.

---

## Features

| Feature                    | Description                                                                   |
| -------------------------- | ----------------------------------------------------------------------------- |
| **Multi-viewport Preview** | Switch instantly between Desktop, Tablet (768 px), and Mobile (375 px)        |
| **Page Management**        | Add, edit, and delete pages with title, slug, and category                    |
| **Category Filtering**     | Pill-style category tabs to focus on one section at a time                    |
| **404 / HTTP Checker**     | HEAD-checks every page URL and flags non-2xx responses in the sidebar         |
| **Screenshot Capture**     | `capturePage()` saves PNGs locally; thumbnail gallery in the bottom panel     |
| **Per-page Notes**         | Write error notes per page (Ctrl+Enter to save); auto-marks the page as Error |
| **Progress Tracking**      | Live progress bar showing Tested / Error / Untested counts                    |
| **Import / Export**        | Import a JSON page list; export to JSON or a formatted `.txt` report          |
| **Theme Support**          | Light, dark, and system-aware themes — persisted across sessions              |
| **Domain Management**      | Set a base domain once; all slugs are resolved against it automatically       |
| **Keyboard Shortcuts**     | `Ctrl+N` new page · `Ctrl+R` reload · `Ctrl+Enter` save note                  |

---

## Installation

Download the latest installer for your platform from the [**Releases**](https://github.com/minhtrung0110/wp-test-tool/releases) page.

| Platform | Installer                      |
| -------- | ------------------------------ |
| Windows  | `WP.Test.Tool-Setup-1.0.4.exe` |
| macOS    | `WP.Test.Tool-1.0.4.dmg`       |
| Linux    | `WP.Test.Tool-1.0.4.AppImage`  |

> **macOS note:** The app is not notarized. Right-click → **Open** to bypass Gatekeeper on first launch, or run:
>
> ```sh
> xattr -cr "/Applications/WP Test Tool.app"
> ```

> **Linux note:** Make the AppImage executable before running:
>
> ```sh
> chmod +x WP.Test.Tool-*.AppImage
> ```

---

## Tech Stack

| Layer         | Library                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Shell         | [Electron 34](https://www.electronjs.org/)                                                         |
| UI Framework  | [React 19](https://react.dev/)                                                                     |
| Language      | [TypeScript 5.8](https://www.typescriptlang.org/) — strict mode                                    |
| Styling       | [Tailwind CSS v4](https://tailwindcss.com/)                                                        |
| State         | [Zustand 5](https://zustand-demo.pmnd.rs/)                                                         |
| Persistence   | [electron-store 8](https://github.com/sindresorhus/electron-store)                                 |
| UI Primitives | [Radix UI](https://www.radix-ui.com/)                                                              |
| Notifications | [Sonner](https://sonner.emilkowal.ski/)                                                            |
| Icons         | [Lucide React](https://lucide.dev/)                                                                |
| Build         | [electron-vite 5](https://electron-vite.org/) + [electron-builder 25](https://www.electron.build/) |

---

## Development

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### Getting Started

```sh
git clone https://github.com/minhtrung0110/wp-test-tool.git
cd wp-test-tool
npm install
npm run dev
```

### Scripts

```sh
npm run dev          # Development server with hot reload
npm run typecheck    # TypeScript check across all three tsconfigs
npm run lint         # ESLint
npm run format       # Prettier
npm run build        # Production build (electron-vite)
npm run build:win    # Windows NSIS installer  →  dist/
npm run build:mac    # macOS DMG               →  dist/
npm run build:linux  # Linux AppImage          →  dist/
```

---

## Architecture

```
src/
├── main/                   Electron main process (Node.js)
│   ├── index.ts            Window lifecycle, splash screen, WebContentsView
│   ├── ipc.ts              IPC handlers + layout constants
│   └── store.ts            electron-store initialization
├── preload/
│   └── index.ts            Context bridge — exposes window.api to the renderer
└── renderer/
    ├── splash-main.tsx     Loading screen entry point
    └── src/
        ├── App.tsx         Root layout (Header · Sidebar · Toolbar · Preview · BottomPanel)
        ├── store/index.ts  Zustand store — all runtime state
        ├── index.css       Tailwind v4 @theme tokens + dark mode overrides
        └── components/
            ├── Sidebar.tsx                Page list, progress bar, category pills
            ├── WebviewToolbar.tsx         URL bar, viewport switcher, screenshot button
            ├── BottomPanel.tsx            Notes & screenshot tabs
            ├── AddPageModal.tsx           Add / edit page dialog
            ├── ManageCategoriesModal.tsx  Category CRUD dialog
            ├── ThemeSelectionModal.tsx    First-launch theme picker
            ├── LoadingScreen.tsx          Splash screen UI
            └── ConfirmDialog.tsx          Generic confirm dialog
```

### Key Patterns

- **IPC-only Node access** — the renderer has no direct Node.js access; all privileged operations go through `window.api.*` defined in the context bridge.
- **WebContentsView overlay** — the live preview is a native `WebContentsView` (not the deprecated `<webview>` tag) positioned by the main process above the HTML layer, enabling true browser rendering.
- **Dual-layer viewport visual** — in Tablet/Mobile mode the renderer shows distinct gutter areas alongside the native overlay, giving immediate visual confirmation of the active viewport width.
- **Two-gate splash** — the main window only appears after _both_ the minimum splash duration (2 s) and the renderer's `app-ready` IPC signal are satisfied.

---

## Releasing

Create and push a semver tag to trigger the GitHub Actions release workflow, which builds installers for all three platforms in parallel and publishes them to a GitHub Release automatically:

```sh
git tag v1.0.0
git push origin v1.0.0
```

---

## Author

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/minhtrung0110">
        <img src="https://github.com/minhtrung0110.png" width="80" alt="Nguyen Duc Minh Trung" /><br /><br />
        <strong>Nguyen Duc Minh Trung</strong>
      </a><br />
      <a href="mailto:minhtrung4367@gmail.com">minhtrung4367@gmail.com</a><br />
      <a href="https://github.com/minhtrung0110">@minhtrung0110</a>
    </td>
  </tr>
</table>

---

<div align="center">

Made with ♥ for the WordPress developer community

</div>
