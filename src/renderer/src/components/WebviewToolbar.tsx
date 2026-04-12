import { useState, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Camera,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore, type Viewport } from '../store'

function HttpStatusBadge({ pageId }: { pageId: string | null }) {
  const httpStatus = useAppStore((s) => s.httpStatus)
  if (!pageId) return null
  const status = httpStatus[pageId]
  if (!status || status === 'checking') return null
  if (status === 'error')
    return (
      <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-error-container/30 text-error-color border border-error-color/20">
        ERR
      </span>
    )
  const ok = (status as number) < 400
  return (
    <span
      className={`px-2 py-0.5 text-[11px] font-mono rounded border ${
        ok
          ? 'bg-success/10 text-success border-success/20'
          : 'bg-error-container/30 text-error-color border-error-color/20'
      }`}
    >
      {status}
    </span>
  )
}

const VIEWPORT_OPTIONS: { id: Viewport; label: string; Icon: React.FC<{ className?: string }> }[] =
  [
    { id: 'desktop', label: 'Desktop', Icon: Monitor },
    { id: 'tablet', label: 'Tablet (768px)', Icon: Tablet },
    { id: 'mobile', label: 'Mobile (375px)', Icon: Smartphone },
  ]

export function WebviewToolbar() {
  const {
    currentUrl,
    setCurrentUrl,
    webviewLoading,
    canGoBack,
    canGoForward,
    viewport,
    setViewport,
    activePageId,
    setTestStatus,
    testState,
    setScreenshots,
    setBottomTab,
  } = useAppStore()

  const [urlInput, setUrlInput] = useState('')
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const displayUrl = editing ? urlInput : currentUrl

  function handleUrlFocus() {
    setUrlInput(currentUrl)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function handleUrlBlur() {
    setEditing(false)
  }

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault()
    let url = urlInput.trim()
    if (!url) return
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`
    }
    setCurrentUrl(url)
    window.api.webviewNavigate(url)
    setEditing(false)
    inputRef.current?.blur()
  }

  async function handleViewportChange(v: Viewport) {
    setViewport(v)
    await window.api.webviewSetViewport(v)
  }

  async function handleScreenshot() {
    if (!activePageId) {
      toast.error('Select a page first.')
      return
    }
    try {
      await window.api.takeScreenshot(activePageId)
      const files = await window.api.getScreenshots(activePageId)
      setScreenshots(files)
      setBottomTab('screenshots')
      toast.success('Screenshot taken!')
    } catch {
      toast.error('Screenshot failed.')
    }
  }

  function handleOpenExternal() {
    if (currentUrl && currentUrl !== 'about:blank') {
      window.api.webviewOpenExternal(currentUrl)
    }
  }

  function handleMarkError() {
    if (activePageId) {
      const current = testState[activePageId]
      setTestStatus(activePageId, current === 'error' ? 'tested' : 'error')
    }
  }

  const isError = activePageId ? testState[activePageId] === 'error' : false

  return (
    <div className="h-[44px] bg-surface-container-low border-b border-outline-variant/10 flex items-center gap-1 px-2 shrink-0">
      {/* Nav buttons */}
      <button
        onClick={() => window.api.webviewGoBack()}
        disabled={!canGoBack}
        className="p-1.5 rounded-md hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed
          text-on-surface-variant hover:text-on-surface transition-colors"
        title="Back"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={() => window.api.webviewGoForward()}
        disabled={!canGoForward}
        className="p-1.5 rounded-md hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed
          text-on-surface-variant hover:text-on-surface transition-colors"
        title="Forward"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <button
        onClick={() => window.api.webviewReload()}
        className={`p-1.5 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface
          transition-colors ${webviewLoading ? 'text-primary' : ''}`}
        title="Reload (Ctrl+R)"
      >
        <RotateCw className={`w-4 h-4 ${webviewLoading ? 'animate-spin' : ''}`} />
      </button>

      {/* URL bar */}
      <form onSubmit={handleUrlSubmit} className="flex-1 mx-1">
        <div
          className={`flex items-center gap-2 bg-surface-container rounded-md px-3 h-[28px]
            border transition-colors ${
              editing ? 'border-primary' : 'border-outline-variant/20 hover:border-outline-variant/40'
            }`}
        >
          {webviewLoading && !editing && (
            <div className="w-2.5 h-2.5 rounded-full border border-primary border-t-transparent animate-spin shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={displayUrl}
            onChange={(e) => setUrlInput(e.target.value)}
            onFocus={handleUrlFocus}
            onBlur={handleUrlBlur}
            placeholder="Enter URL..."
            className="flex-1 bg-transparent text-[12px] text-on-surface font-mono outline-none
              placeholder:text-on-surface-variant/30 min-w-0"
          />
          <HttpStatusBadge pageId={activePageId} />
        </div>
      </form>

      {/* Error marker */}
      {activePageId && (
        <button
          onClick={handleMarkError}
          title={isError ? 'Clear error mark' : 'Mark as error'}
          className={`px-2 py-1 text-[11px] rounded-md border transition-colors ${
            isError
              ? 'bg-error-container/30 text-error-color border-error-color/30'
              : 'text-on-surface-variant border-outline-variant/20 hover:bg-surface-container'
          }`}
        >
          {isError ? '✗ Error' : 'Mark Error'}
        </button>
      )}

      {/* Separator */}
      <div className="w-px h-5 bg-outline-variant/20 mx-0.5" />

      {/* Viewport toggles */}
      <div className="flex items-center bg-surface-container rounded-md p-0.5">
        {VIEWPORT_OPTIONS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => handleViewportChange(id)}
            title={label}
            className={`p-1.5 rounded transition-colors ${
              viewport === id
                ? 'bg-primary text-white'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-outline-variant/20 mx-0.5" />

      {/* Screenshot */}
      <button
        onClick={handleScreenshot}
        title="Screenshot"
        className="p-1.5 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <Camera className="w-4 h-4" />
      </button>

      {/* Open in browser */}
      <button
        onClick={handleOpenExternal}
        title="Open in browser"
        disabled={!currentUrl || currentUrl === 'about:blank'}
        className="p-1.5 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface
          transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  )
}
