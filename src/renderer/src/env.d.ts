/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare interface Window {
  electron: {
    ipcRenderer: import('electron').IpcRenderer
  }
  api: {
    getStoreValue: (key: string) => Promise<any>
    setStoreValue: (key: string, value: any) => Promise<void>
  }
}
