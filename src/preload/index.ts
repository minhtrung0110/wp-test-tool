import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

type Viewport = 'desktop' | 'tablet' | 'mobile'

const api = {
  // ── Store ─────────────────────────────────────────────────────────
  getStoreValue: (key: string) => ipcRenderer.invoke('store:get', key),
  setStoreValue: (key: string, value: unknown) => ipcRenderer.invoke('store:set', key, value),

  // ── App lifecycle ─────────────────────────────────────────────────
  notifyReady: () => ipcRenderer.send('app-ready'),
  setNativeTheme: (theme: string) => ipcRenderer.invoke('theme:set-native', theme),
  webviewSetVisible: (visible: boolean) => ipcRenderer.invoke('webview:set-visible', visible),

  // ── Webview navigation ────────────────────────────────────────────
  webviewNavigate: (url: string) => ipcRenderer.invoke('webview:navigate', url),
  webviewGoBack: () => ipcRenderer.invoke('webview:go-back'),
  webviewGoForward: () => ipcRenderer.invoke('webview:go-forward'),
  webviewReload: () => ipcRenderer.invoke('webview:reload'),
  webviewSetViewport: (v: Viewport) => ipcRenderer.invoke('webview:set-viewport', v),
  webviewSetBottomHeight: (h: number) => ipcRenderer.invoke('webview:set-bottom-height', h),
  webviewOpenExternal: (url: string) => ipcRenderer.invoke('webview:open-external', url),

  // ── Screenshot ────────────────────────────────────────────────────
  takeScreenshot: (pageId: string) => ipcRenderer.invoke('webview:screenshot', pageId),
  getScreenshots: (pageId: string) => ipcRenderer.invoke('webview:get-screenshots', pageId),
  openScreenshotsFolder: (pageId: string) =>
    ipcRenderer.invoke('webview:open-screenshots-folder', pageId),

  // ── 404 check ─────────────────────────────────────────────────────
  checkPagesStatus: (pages: { id: string; url: string }[]) =>
    ipcRenderer.invoke('pages:check-status', pages),

  // ── File operations ───────────────────────────────────────────────
  importJson: () => ipcRenderer.invoke('file:import-json'),
  exportJson: (data: unknown) => ipcRenderer.invoke('file:export-json', data),
  exportReport: (content: string) => ipcRenderer.invoke('file:export-report', content),

  // ── Events from main → renderer ───────────────────────────────────
  onWebviewLoading: (cb: (loading: boolean) => void) => {
    const fn = (_: unknown, v: boolean) => cb(v)
    ipcRenderer.on('webview:loading', fn)
    return () => ipcRenderer.removeListener('webview:loading', fn)
  },
  onWebviewNavState: (cb: (s: { canGoBack: boolean; canGoForward: boolean }) => void) => {
    const fn = (_: unknown, s: { canGoBack: boolean; canGoForward: boolean }) => cb(s)
    ipcRenderer.on('webview:nav-state', fn)
    return () => ipcRenderer.removeListener('webview:nav-state', fn)
  },
  onWebviewTitle: (cb: (title: string) => void) => {
    const fn = (_: unknown, t: string) => cb(t)
    ipcRenderer.on('webview:title', fn)
    return () => ipcRenderer.removeListener('webview:title', fn)
  },
  onWebviewUrlChanged: (cb: (url: string) => void) => {
    const fn = (_: unknown, url: string) => cb(url)
    ipcRenderer.on('webview:url-changed', fn)
    return () => ipcRenderer.removeListener('webview:url-changed', fn)
  },
  onWebviewLoadError: (
    cb: (err: { errorCode: number; errorDescription: string }) => void
  ) => {
    const fn = (_: unknown, e: { errorCode: number; errorDescription: string }) => cb(e)
    ipcRenderer.on('webview:load-error', fn)
    return () => ipcRenderer.removeListener('webview:load-error', fn)
  },
  onPageStatusResult: (cb: (r: { id: string; status: number | 'error' }) => void) => {
    const fn = (_: unknown, r: { id: string; status: number | 'error' }) => cb(r)
    ipcRenderer.on('pages:status-result', fn)
    return () => ipcRenderer.removeListener('pages:status-result', fn)
  },
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
