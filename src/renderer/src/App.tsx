import { useEffect, useRef, useState } from 'react'
import { MonitorPlay, Sun, Moon, Monitor, Download, Upload, FileText } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { useAppStore, type Page } from './store'
import { ThemeSelectionModal, type Theme } from './components/ThemeSelectionModal'
import { Sidebar } from './components/Sidebar'
import { WebviewToolbar } from './components/WebviewToolbar'
import { BottomPanel } from './components/BottomPanel'
import { AddPageModal } from './components/AddPageModal'
import { ManageCategoriesModal } from './components/ManageCategoriesModal'

// ── Helpers ──────────────────────────────────────────────────────────

function applyTheme(theme: string) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (theme === 'dark' || (theme === 'system' && prefersDark)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// ── App Header ───────────────────────────────────────────────────────

function getPageUrl(domain: string, slug: string): string {
  const d = domain.replace(/\/$/, '')
  const s = slug.startsWith('/') ? slug : `/${slug}`
  return d ? `${d}${s}` : slug
}

function Header() {
  const { domain, setDomain, theme, setTheme, pages, testState, notes, categories, activePageId } =
    useAppStore()
  const [domainInput, setDomainInput] = useState(domain)

  useEffect(() => {
    setDomainInput(domain)
  }, [domain])

  const THEME_CYCLE: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  async function handleSaveDomain() {
    const trimmed = domainInput.trim().replace(/\/$/, '')
    setDomain(trimmed)
    await window.api.setStoreValue('domain', trimmed)
    toast.success('Domain updated')
    // Reload webview if a page is currently active
    if (activePageId) {
      const activePage = pages.find((p) => p.id === activePageId)
      if (activePage) {
        window.api.webviewNavigate(getPageUrl(trimmed, activePage.slug))
      }
    }
  }

  async function handleThemeCycle() {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % 3]
    setTheme(next)
    applyTheme(next)
    await window.api.setStoreValue('theme', next)
    window.api.setNativeTheme(next)
  }

  async function handleExportJson() {
    const data = {
      domain,
      categories,
      pages: pages.map(({ id, title, slug, category }) => ({ id, title, slug, category })),
    }
    const ok = await window.api.exportJson(data)
    if (ok) toast.success('Exported pages.json')
  }

  async function handleImportJson() {
    const data = await window.api.importJson()
    if (!data || typeof data !== 'object') return
    const d = data as {
      domain?: string
      categories?: string[]
      pages?: Page[]
    }
    if (d.domain) {
      useAppStore.getState().setDomain(d.domain)
      await window.api.setStoreValue('domain', d.domain)
    }
    if (Array.isArray(d.categories) && d.categories.length) {
      useAppStore.getState().setCategories(d.categories)
      await window.api.setStoreValue('categories', d.categories)
    }
    if (Array.isArray(d.pages)) {
      useAppStore.getState().setPages(d.pages)
      await window.api.setStoreValue('pages', d.pages)
    }
    toast.success('Data imported!')
  }

  async function handleExportReport() {
    const now = new Date().toLocaleString('en-US')
    const lines: string[] = [
      `WP Test Tool — Test Report`,
      `Domain: ${domain}`,
      `Date: ${now}`,
      `Total pages: ${pages.length}`,
      '',
      '─'.repeat(60),
      '',
    ]
    for (const page of pages) {
      const status = testState[page.id] ?? 'untested'
      const note = notes[page.id]?.trim() ?? ''
      const statusLabel = status === 'tested' ? 'OK' : status === 'error' ? 'ERROR' : 'Untested'
      lines.push(`[${statusLabel}] ${page.title}`)
      lines.push(`      ${page.slug}`)
      if (note) lines.push(`      Note: ${note}`)
      lines.push('')
    }
    const ok = await window.api.exportReport(lines.join('\n'))
    if (ok) toast.success('Report exported!')
  }

  return (
    <header className="h-[52px] bg-surface-container-low border-b border-outline-variant/10 flex items-center gap-3 px-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0 w-[232px]">
        <img src="/icon.png" alt="WP Test Tool" className="w-6 h-6 rounded object-contain shrink-0" draggable={false} />
        <span className="text-[14px] font-bold font-display text-on-surface">WP Test Tool</span>
      </div>

      {/* Domain input */}
      <div className="flex-1 flex items-center gap-2">
        <input
          type="text"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSaveDomain()}
          placeholder="http://yoursite.local"
          className="flex-1 bg-surface-container rounded-md px-3 py-1.5 text-[13px] font-mono text-on-surface
            border border-outline-variant/20 focus:outline-none focus:border-primary
            placeholder:text-on-surface-variant/30 transition-colors h-[30px]"
        />
        <button
          onClick={handleSaveDomain}
          className="px-3 h-[30px] text-[13px] font-medium text-white bg-primary rounded-md
            hover:bg-primary-container transition-colors whitespace-nowrap active:scale-[0.98]"
        >
          Save
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleImportJson}
          title="Import JSON"
          className="p-1.5 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <Upload className="w-4 h-4" />
        </button>
        <button
          onClick={handleExportJson}
          title="Export JSON"
          className="p-1.5 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={handleExportReport}
          title="Export report (.txt)"
          className="p-1.5 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <FileText className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-outline-variant/20 mx-1" />

        <button
          onClick={handleThemeCycle}
          title={`Theme: ${theme}`}
          className="p-1.5 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ThemeIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}

// ── App Root ─────────────────────────────────────────────────────────

export function App() {
  const {
    setDomain,
    setPages,
    setCategories,
    setTestStatus,
    setNote,
    setHttpStatus,
    setTheme,
    setWebviewLoading,
    setWebviewTitle,
    setCanGoBack,
    setCanGoForward,
    setCurrentUrl,
    activePageId,
    testState,
    setTestStatus: markTested,
    openAddModal,
  } = useAppStore()

  const viewport = useAppStore((s) => s.viewport)

  const [showThemeModal, setShowThemeModal] = useState(false)
  const [initDone, setInitDone] = useState(false)
  const prevLoading = useRef(false)
  const webviewLoading = useAppStore((s) => s.webviewLoading)
  const pageModalOpen = useAppStore((s) => s.pageModalOpen)
  const categoryModalOpen = useAppStore((s) => s.categoryModalOpen)
  const dialogOpen = useAppStore((s) => s.dialogOpen)

  // ── Init from electron-store ────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const [savedDomain, savedPages, savedCategories, savedTheme, savedTestState, savedNotes] =
          await Promise.all([
            window.api.getStoreValue('domain'),
            window.api.getStoreValue('pages'),
            window.api.getStoreValue('categories'),
            window.api.getStoreValue('theme'),
            window.api.getStoreValue('testState'),
            window.api.getStoreValue('notes'),
          ])

        if (typeof savedDomain === 'string' && savedDomain) setDomain(savedDomain)
        if (Array.isArray(savedPages) && savedPages.length) setPages(savedPages as Page[])
        if (Array.isArray(savedCategories) && savedCategories.length)
          setCategories(savedCategories as string[])

        if (savedTheme && typeof savedTheme === 'string') {
          setTheme(savedTheme as 'light' | 'dark' | 'system')
          applyTheme(savedTheme)
        } else {
          setShowThemeModal(true)
        }

        if (savedTestState && typeof savedTestState === 'object') {
          Object.entries(savedTestState as Record<string, string>).forEach(([id, status]) => {
            setTestStatus(id, status as 'untested' | 'tested' | 'error')
          })
        }
        if (savedNotes && typeof savedNotes === 'object') {
          Object.entries(savedNotes as Record<string, string>).forEach(([id, note]) => {
            setNote(id, note)
          })
        }
      } catch (err) {
        console.error('Init error', err)
      }

      // Signal that init is complete — notifyReady() is deferred to a
      // useEffect so React has committed the render (including the theme
      // modal, if shown) before the main window becomes visible.
      setInitDone(true)
    }

    init()
  }, [])

  // Notify main process only AFTER React has committed the post-init render.
  // This prevents the two-gate splash from closing before the theme modal
  // (or any other first-render state) is actually painted on screen.
  useEffect(() => {
    if (initDone) {
      window.api.notifyReady()
    }
  }, [initDone])

  // Hide the native WebContentsView whenever any modal/dialog is open.
  // WebContentsView renders at the OS level above all HTML, so without this
  // the modals appear behind the (possibly white) preview pane.
  useEffect(() => {
    const anyOpen = pageModalOpen || categoryModalOpen || dialogOpen || showThemeModal
    window.api.webviewSetVisible(!anyOpen)
  }, [pageModalOpen, categoryModalOpen, dialogOpen, showThemeModal])

  // ── Subscribe to webview IPC events ────────────────────────────
  useEffect(() => {
    const unsubs = [
      window.api.onWebviewLoading(setWebviewLoading),
      window.api.onWebviewNavState(({ canGoBack, canGoForward }) => {
        setCanGoBack(canGoBack)
        setCanGoForward(canGoForward)
      }),
      window.api.onWebviewTitle(setWebviewTitle),
      window.api.onWebviewUrlChanged(setCurrentUrl),
      window.api.onWebviewLoadError(() => {
        // Could show error state in toolbar
      }),
      window.api.onPageStatusResult(({ id, status }) => {
        setHttpStatus(id, status)
      }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [])

  // ── Auto-mark page as tested when load completes ────────────────
  const activePageIdRef = useRef(activePageId)
  useEffect(() => {
    activePageIdRef.current = activePageId
  }, [activePageId])

  useEffect(() => {
    if (prevLoading.current && !webviewLoading) {
      const id = activePageIdRef.current
      if (id && testState[id] !== 'error') {
        markTested(id, 'tested')
      }
    }
    prevLoading.current = webviewLoading
  }, [webviewLoading])

  // ── Persist test state changes ──────────────────────────────────
  useEffect(() => {
    window.api.setStoreValue('testState', testState)
  }, [testState])

  // ── Keyboard shortcuts ──────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key === 'n') {
        e.preventDefault()
        openAddModal()
      }
      if (mod && e.key === 'r') {
        e.preventDefault()
        window.api.webviewReload()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // ── Theme selection (first launch) ─────────────────────────────
  async function handleThemeConfirm(theme: Theme) {
    useAppStore.getState().setTheme(theme)
    applyTheme(theme)
    await window.api.setStoreValue('theme', theme)
    window.api.setNativeTheme(theme)
    setShowThemeModal(false)
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-surface text-on-surface font-sans">
      {showThemeModal && <ThemeSelectionModal onConfirm={handleThemeConfirm} />}
      <Toaster position="bottom-right" richColors />

      {/* App Header — full width */}
      <Header />

      {/* Below header */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Webview toolbar */}
          <WebviewToolbar />

          {/* Webview placeholder — WebContentsView overlays here */}
          <div
            className={`flex-1 pointer-events-none relative overflow-hidden transition-colors ${
              viewport !== 'desktop'
                ? 'bg-[#b0b4bc] dark:bg-[#060b15]'
                : 'bg-surface-container'
            }`}
          >
            {/* Device-area panel — sits behind the native view, gives visible frame in non-desktop modes */}
            {viewport !== 'desktop' && (
              <div
                className="absolute inset-y-0 bg-surface-container shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                style={{
                  left: `max(0px, calc((100% - ${viewport === 'mobile' ? 375 : 768}px) / 2))`,
                  right: `max(0px, calc((100% - ${viewport === 'mobile' ? 375 : 768}px) / 2))`,
                }}
              />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant/20 select-none gap-2">
              <MonitorPlay className="w-12 h-12" />
              <p className="text-[12px]">Preview</p>
            </div>
          </div>

          {/* Bottom panel */}
          <BottomPanel />
        </div>
      </div>

      {/* Modals */}
      <AddPageModal />
      <ManageCategoriesModal />
    </div>
  )
}
