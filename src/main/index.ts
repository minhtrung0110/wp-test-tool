import { app, BrowserWindow, WebContentsView } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { setupIpc } from './ipc'

function createWindow(): void {
  // Create Main Window (React UI)
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Load React App
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Create WebContentsView (Web Preview Tool)
  // Let's create a placeholder WebContentsView and attach it to mainWindow's contentView
  const view = new WebContentsView()
  mainWindow.contentView.addChildView(view)
  
  // Example dimensions: position it on the right side
  view.setBounds({ x: 300, y: 0, width: 900, height: 800 })
  view.webContents.loadURL('https://google.com')
  
  // When window resizes, update view bounds
  mainWindow.on('resize', () => {
    const bounds = mainWindow.getBounds()
    // adjust bounds for view based on your specific layout design.
    // Assuming a 300px sidebar: bounds.width - 300
    // NOTE: getBounds() includes window framing, while setBounds for view is client area. 
    // Usually standard to calculate off mainWindow.getContentBounds()
    const contentBounds = mainWindow.getContentBounds()
    view.setBounds({
      x: 300,
      y: 0,
      width: contentBounds.width - 300,
      height: contentBounds.height
    })
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.wptesttool')

  // Default bindings (F12, etc.)
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupIpc()
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
