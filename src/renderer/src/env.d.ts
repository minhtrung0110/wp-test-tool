/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

type Viewport = 'desktop' | 'tablet' | 'mobile'

declare interface Window {
  electron: {
    ipcRenderer: import('electron').IpcRenderer
  }
  api: {
    // Store
    getStoreValue: (key: string) => Promise<unknown>
    setStoreValue: (key: string, value: unknown) => Promise<void>
    // Lifecycle
    notifyReady: () => void
    setNativeTheme: (theme: string) => Promise<void>
    webviewSetVisible: (visible: boolean) => Promise<void>
    // Webview navigation
    webviewNavigate: (url: string) => Promise<void>
    webviewGoBack: () => Promise<void>
    webviewGoForward: () => Promise<void>
    webviewReload: () => Promise<void>
    webviewClearCache: () => Promise<void>
    webviewSetViewport: (v: Viewport) => Promise<void>
    webviewSetBottomHeight: (h: number) => Promise<void>
    webviewOpenExternal: (url: string) => Promise<void>
    // Screenshot
    takeScreenshot: (pageId: string) => Promise<string>
    getScreenshots: (pageId: string) => Promise<string[]>
    openScreenshotsFolder: (pageId: string) => Promise<void>
    // 404 check
    checkPagesStatus: (pages: { id: string; url: string }[]) => Promise<void>
    // File ops
    importJson: () => Promise<unknown>
    exportJson: (data: unknown) => Promise<boolean>
    exportReport: (content: string) => Promise<boolean>
    // Events
    onWebviewLoading: (cb: (loading: boolean) => void) => () => void
    onWebviewNavState: (
      cb: (s: { canGoBack: boolean; canGoForward: boolean }) => void
    ) => () => void
    onWebviewTitle: (cb: (title: string) => void) => () => void
    onWebviewUrlChanged: (cb: (url: string) => void) => () => void
    onWebviewLoadError: (
      cb: (err: { errorCode: number; errorDescription: string }) => void
    ) => () => void
    onPageStatusResult: (
      cb: (r: { id: string; status: number | 'error' }) => void
    ) => () => void
  }
}
