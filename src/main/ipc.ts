import { ipcMain, net, app, dialog, shell, nativeTheme } from 'electron'
import { getStoreValue, setStoreValue } from './store'
import path from 'path'
import fs from 'fs'
import type { WebContentsView, BrowserWindow } from 'electron'

export const SIDEBAR_WIDTH = 260
export const HEADER_HEIGHT = 52
export const TOOLBAR_HEIGHT = 44
export const BOTTOM_PANEL_HEIGHT = 200

let currentViewport: 'desktop' | 'tablet' | 'mobile' = 'desktop'
let bottomPanelHeight = BOTTOM_PANEL_HEIGHT

export function updateViewBounds(view: WebContentsView, mainWindow: BrowserWindow): void {
  const bounds = mainWindow.getContentBounds()
  const areaW = bounds.width - SIDEBAR_WIDTH
  const areaH = bounds.height - HEADER_HEIGHT - TOOLBAR_HEIGHT - bottomPanelHeight

  let x = SIDEBAR_WIDTH
  let w = areaW

  if (currentViewport === 'tablet' && areaW > 768) {
    w = 768
    x = SIDEBAR_WIDTH + Math.floor((areaW - 768) / 2)
  } else if (currentViewport === 'mobile' && areaW > 375) {
    w = 375
    x = SIDEBAR_WIDTH + Math.floor((areaW - 375) / 2)
  }

  view.setBounds({
    x,
    y: HEADER_HEIGHT + TOOLBAR_HEIGHT,
    width: Math.max(w, 50),
    height: Math.max(areaH, 50),
  })
}

export function setupIpc(view: WebContentsView, mainWindow: BrowserWindow): void {
  // ── Store ─────────────────────────────────────────────────────────
  ipcMain.handle('store:get', (_, key: string) => getStoreValue(key))
  ipcMain.handle('store:set', (_, key: string, value: unknown) => setStoreValue(key, value))

  // ── Webview visibility ────────────────────────────────────────────
  ipcMain.handle('webview:set-visible', (_, visible: boolean) => {
    if (visible) {
      updateViewBounds(view, mainWindow)
    } else {
      // Move off-screen; the view stays alive so navigation state is preserved
      view.setBounds({ x: -99999, y: 0, width: 1, height: 1 })
    }
  })

  // ── Native theme ──────────────────────────────────────────────────
  ipcMain.handle('theme:set-native', (_, theme: string) => {
    if (theme === 'dark') nativeTheme.themeSource = 'dark'
    else if (theme === 'light') nativeTheme.themeSource = 'light'
    else nativeTheme.themeSource = 'system'
  })

  // ── Webview navigation ────────────────────────────────────────────
  ipcMain.handle('webview:navigate', (_, url: string) => {
    view.webContents.loadURL(url)
  })

  ipcMain.handle('webview:go-back', () => {
    if (view.webContents.canGoBack()) view.webContents.goBack()
  })

  ipcMain.handle('webview:go-forward', () => {
    if (view.webContents.canGoForward()) view.webContents.goForward()
  })

  ipcMain.handle('webview:reload', () => {
    view.webContents.reload()
  })

  ipcMain.handle('webview:set-viewport', (_, viewport: 'desktop' | 'tablet' | 'mobile') => {
    currentViewport = viewport
    updateViewBounds(view, mainWindow)
  })

  ipcMain.handle('webview:set-bottom-height', (_, height: number) => {
    bottomPanelHeight = height
    updateViewBounds(view, mainWindow)
  })

  ipcMain.handle('webview:open-external', (_, url: string) => {
    shell.openExternal(url)
  })

  // ── Screenshot ────────────────────────────────────────────────────
  ipcMain.handle('webview:screenshot', async (_, pageId: string) => {
    const image = await view.webContents.capturePage()
    const dir = path.join(app.getPath('userData'), 'screenshots', pageId)
    fs.mkdirSync(dir, { recursive: true })
    const filePath = path.join(dir, `${Date.now()}.png`)
    fs.writeFileSync(filePath, image.toPNG())
    return filePath
  })

  ipcMain.handle('webview:get-screenshots', (_, pageId: string) => {
    const dir = path.join(app.getPath('userData'), 'screenshots', pageId)
    if (!fs.existsSync(dir)) return []
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.png'))
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 10)
      .map((f) => path.join(dir, f))
  })

  ipcMain.handle('webview:open-screenshots-folder', (_, pageId: string) => {
    const dir = path.join(app.getPath('userData'), 'screenshots', pageId)
    fs.mkdirSync(dir, { recursive: true })
    shell.openPath(dir)
  })

  // ── 404 checker ───────────────────────────────────────────────────
  ipcMain.handle(
    'pages:check-status',
    (_, pages: { id: string; url: string }[]) => {
      return Promise.all(
        pages.map(
          ({ id, url }) =>
            new Promise<void>((resolve) => {
              try {
                const req = net.request({ method: 'HEAD', url })
                req.on('response', (res) => {
                  mainWindow.webContents.send('pages:status-result', { id, status: res.statusCode })
                  resolve()
                })
                req.on('error', () => {
                  mainWindow.webContents.send('pages:status-result', { id, status: 'error' })
                  resolve()
                })
                req.end()
              } catch {
                mainWindow.webContents.send('pages:status-result', { id, status: 'error' })
                resolve()
              }
            })
        )
      )
    }
  )

  // ── File I/O ──────────────────────────────────────────────────────
  ipcMain.handle('file:import-json', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (result.canceled || !result.filePaths[0]) return null
    const raw = fs.readFileSync(result.filePaths[0], 'utf-8')
    return JSON.parse(raw)
  })

  ipcMain.handle('file:export-json', async (_, data: unknown) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: 'pages.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    if (result.canceled || !result.filePath) return false
    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  })

  ipcMain.handle('file:export-report', async (_, content: string) => {
    const defaultName = `wp-test-report-${new Date().toISOString().slice(0, 10)}.txt`
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultName,
      filters: [{ name: 'Text', extensions: ['txt'] }],
    })
    if (result.canceled || !result.filePath) return false
    fs.writeFileSync(result.filePath, content, 'utf-8')
    return true
  })

  // ── Webview events → relay to renderer ───────────────────────────
  view.webContents.on('did-start-loading', () => {
    mainWindow.webContents.send('webview:loading', true)
  })

  view.webContents.on('did-stop-loading', () => {
    mainWindow.webContents.send('webview:loading', false)
    mainWindow.webContents.send('webview:nav-state', {
      canGoBack: view.webContents.canGoBack(),
      canGoForward: view.webContents.canGoForward(),
    })
  })

  view.webContents.on('page-title-updated', (_, title) => {
    mainWindow.webContents.send('webview:title', title)
  })

  view.webContents.on('did-navigate', (_, url) => {
    mainWindow.webContents.send('webview:url-changed', url)
    mainWindow.webContents.send('webview:nav-state', {
      canGoBack: view.webContents.canGoBack(),
      canGoForward: view.webContents.canGoForward(),
    })
  })

  view.webContents.on('did-navigate-in-page', (_, url) => {
    mainWindow.webContents.send('webview:url-changed', url)
  })

  view.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
    if (errorCode !== -3) {
      mainWindow.webContents.send('webview:load-error', { errorCode, errorDescription })
    }
  })
}
