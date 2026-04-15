import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, WebContentsView, nativeTheme } from 'electron'
import path, { join } from 'path'
import {
  setupIpc,
  updateViewBounds,
  HEADER_HEIGHT,
  TOOLBAR_HEIGHT,
  SIDEBAR_WIDTH,
  BOTTOM_PANEL_HEIGHT,
} from './ipc'
import { getStoreValue } from './store'

function resolveIcon(name: string): string {
  return is.dev
    ? path.join(__dirname, '../../assets', name)
    : path.join(process.resourcesPath, 'assets', name)
}

const SPLASH_MIN_MS = 2000

function applyNativeTheme() {
  const saved = getStoreValue('theme') as string | null | undefined
  if (saved === 'dark') nativeTheme.themeSource = 'dark'
  else if (saved === 'light') nativeTheme.themeSource = 'light'
  else nativeTheme.themeSource = 'system'
}

function createSplashWindow(): BrowserWindow {
  const splash = new BrowserWindow({
    width: 560,
    height: 460,
    frame: false,
    resizable: false,
    center: true,
    show: true,
    skipTaskbar: true,
    webPreferences: { sandbox: false },
    icon: resolveIcon('icon.png'),
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    splash.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/splash.html`)
  } else {
    splash.loadFile(join(__dirname, '../renderer/splash.html'))
  }

  return splash
}

function createWindow(): void {
  // Apply saved theme before any window is shown → prevents white flash in dark mode
  applyNativeTheme()

  const splash = createSplashWindow()

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#070c17' : '#f8f9fb',
    icon: resolveIcon('icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  // ── Two-gate mechanism: enforce minimum splash duration ────────────
  let rendererReady = false
  let minTimeElapsed = false

  function attemptTransition() {
    if (!rendererReady || !minTimeElapsed) return
    if (!splash.isDestroyed()) splash.close()
    mainWindow.show()
    mainWindow.focus()
  }

  // Gate 1: minimum 2-second splash display
  setTimeout(() => {
    minTimeElapsed = true
    attemptTransition()
  }, SPLASH_MIN_MS)

  // Gate 2: renderer signals it is fully initialised and has rendered
  ipcMain.once('app-ready', () => {
    rendererReady = true
    attemptTransition()
  })

  // ── Load renderer ──────────────────────────────────────────────────
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // ── WebContentsView (preview pane) ─────────────────────────────────
  // Use a dedicated session so clearCache() only affects the preview pane,
  // not the renderer window. "persist:" keeps cookies/login state across restarts.
  const view = new WebContentsView({
    webPreferences: {
      partition: 'persist:preview',
    },
  })
  mainWindow.contentView.addChildView(view)
  view.webContents.loadURL('about:blank')

  const bounds = mainWindow.getContentBounds()
  view.setBounds({
    x: SIDEBAR_WIDTH,
    y: HEADER_HEIGHT + TOOLBAR_HEIGHT,
    width: bounds.width - SIDEBAR_WIDTH,
    height: bounds.height - HEADER_HEIGHT - TOOLBAR_HEIGHT - BOTTOM_PANEL_HEIGHT,
  })

  mainWindow.on('resize', () => {
    updateViewBounds(view, mainWindow)
  })

  setupIpc(view, mainWindow)
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.wptesttool')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
