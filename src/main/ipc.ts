import { ipcMain } from 'electron'
import { getStoreValue, setStoreValue } from './store'

export function setupIpc() {
  ipcMain.handle('store:get', (_, key: string) => {
    return getStoreValue(key)
  })

  ipcMain.handle('store:set', (_, key: string, value: any) => {
    setStoreValue(key, value)
  })

  // Add more IPC handlers here
}
