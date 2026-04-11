import { useState, useEffect } from 'react'
import { Rocket, MonitorPlay } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { useAppStore } from './store'

export function App() {
  const { url, setUrl } = useAppStore()
  const [storeValue, setStoreValue] = useState<string>('')

  useEffect(() => {
    // Example of calling IPC via context bridge
    const fetchStore = async () => {
      try {
        const val = await window.api.getStoreValue('lastUrl')
        if (val) {
          setUrl(val)
          setStoreValue(val)
        }
      } catch (error) {
        console.error('Failed to get store value', error)
      }
    }
    fetchStore()
  }, [setUrl])

  const handleSave = async () => {
    try {
      await window.api.setStoreValue('lastUrl', url)
      toast.success('Đã lưu URL làm mặc định!')
    } catch (error) {
      toast.error('Lỗi khi lưu cài đặt.')
    }
  }

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-200 font-sans">
      <Toaster theme="dark" position="bottom-right" />
      
      {/* Sidebar - 300px width as configured in Main Process indexing */}
      <aside className="w-[300px] border-r border-slate-800 bg-slate-900 flex flex-col p-6 shadow-2xl z-10 shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/20 rounded-xl">
            <MonitorPlay className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            WP Test Tool
          </h1>
        </div>

        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Target URL</label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="https://example.com"
            />
          </div>

          <button 
            onClick={handleSave}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-lg transition-colors active:scale-[0.98]"
          >
            <Rocket className="w-4 h-4" />
            <span>Lưu cấu hình</span>
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800 text-xs text-slate-500 text-center">
          <p>Powered by Electron 34 & React 19</p>
          <p className="mt-1">Tailwind CSS v4 + Zustand</p>
        </div>
      </aside>

      {/* Main Content Area - Trống rỗng để WebContentsView phủ lên */}
      <main className="flex-1 bg-slate-950 relative flex items-center justify-center pointer-events-none">
        {/* Placeholder UI if WebContentsView is hidden/loading */}
        <div className="text-slate-600 text-center space-y-3">
          <MonitorPlay className="w-16 h-16 mx-auto opacity-20" />
          <p>Đang tải Web Preview...</p>
        </div>
      </main>
    </div>
  )
}
