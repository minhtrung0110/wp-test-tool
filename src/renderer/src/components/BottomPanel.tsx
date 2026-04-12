import { useEffect, useRef, useState } from 'react'
import { FileText, Image, Save, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '../store'

function NotesTab() {
  const { activePageId, notes, setNote, setTestStatus, testState } = useAppStore()
  const [draft, setDraft] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setDraft(activePageId ? (notes[activePageId] ?? '') : '')
  }, [activePageId, notes])

  async function handleSave() {
    if (!activePageId) return
    setNote(activePageId, draft)
    // If note is non-empty, mark as error; if cleared, revert to tested if was error
    if (draft.trim() && testState[activePageId] !== 'error') {
      setTestStatus(activePageId, 'error')
    } else if (!draft.trim() && testState[activePageId] === 'error') {
      setTestStatus(activePageId, 'tested')
    }
    // Persist notes
    const allNotes = useAppStore.getState().notes
    await window.api.setStoreValue('notes', { ...allNotes, [activePageId]: draft })
    toast.success('Note saved', { duration: 1500 })
  }

  if (!activePageId) {
    return (
      <div className="flex-1 flex items-center justify-center text-on-surface-variant/30 text-[13px]">
        Select a page to add notes
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault()
            handleSave()
          }
        }}
        placeholder="Note CSS/layout issues for this page... (Ctrl+Enter to save)"
        className="flex-1 resize-none bg-transparent text-[13px] text-on-surface px-4 py-2
          outline-none placeholder:text-on-surface-variant/25 leading-relaxed font-sans"
      />
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-outline-variant/10 shrink-0">
        <p className="text-[11px] text-on-surface-variant/40">Ctrl+Enter to save</p>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium
            text-primary border border-primary/20 rounded-md hover:bg-primary/8 transition-colors"
        >
          <Save className="w-3 h-3" />
          Save
        </button>
      </div>
    </div>
  )
}

function ScreenshotsTab() {
  const { activePageId, screenshots, setScreenshots } = useAppStore()

  useEffect(() => {
    async function load() {
      if (!activePageId) {
        setScreenshots([])
        return
      }
      const files = await window.api.getScreenshots(activePageId)
      setScreenshots(files)
    }
    load()
  }, [activePageId])

  if (!activePageId) {
    return (
      <div className="flex-1 flex items-center justify-center text-on-surface-variant/30 text-[13px]">
        Select a page to view screenshots
      </div>
    )
  }

  if (screenshots.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-on-surface-variant/30 text-[13px]">
        No screenshots yet. Use the camera button on the toolbar.
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 flex gap-2 overflow-x-auto px-3 py-2 items-start scrollbar-none">
        {screenshots.map((filePath) => {
          const fileName = filePath.split(/[\\/]/).pop() ?? filePath
          const ts = parseInt(fileName.replace('.png', ''), 10)
          const label = isNaN(ts)
            ? fileName
            : new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

          return (
            <div key={filePath} className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-[120px] h-[75px] bg-surface-container rounded-md overflow-hidden border border-outline-variant/20">
                <img
                  src={`file://${filePath}`}
                  alt={label}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              <p className="text-[10px] font-mono text-on-surface-variant/50 max-w-[120px] truncate">
                {label}
              </p>
            </div>
          )
        })}
      </div>
      <div className="px-3 py-1.5 border-t border-outline-variant/10 shrink-0 flex justify-end">
        <button
          onClick={() => activePageId && window.api.openScreenshotsFolder(activePageId)}
          className="flex items-center gap-1.5 px-3 py-1 text-[12px] text-on-surface-variant
            border border-outline-variant/20 rounded-md hover:bg-surface-container transition-colors"
        >
          <FolderOpen className="w-3 h-3" />
          Open folder
        </button>
      </div>
    </div>
  )
}

export function BottomPanel() {
  const { bottomTab, setBottomTab } = useAppStore()

  const tabs = [
    { id: 'notes' as const, label: 'Notes', Icon: FileText },
    { id: 'screenshots' as const, label: 'Screenshots', Icon: Image },
  ]

  return (
    <div className="h-[200px] bg-surface border-t border-outline-variant/10 flex flex-col shrink-0">
      {/* Tab bar */}
      <div className="flex items-center gap-0 px-2 border-b border-outline-variant/10 shrink-0 h-[34px]">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setBottomTab(id)}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-md transition-colors',
              bottomTab === id
                ? 'text-primary font-medium'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
            ].join(' ')}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {bottomTab === 'notes' ? <NotesTab /> : <ScreenshotsTab />}
    </div>
  )
}
