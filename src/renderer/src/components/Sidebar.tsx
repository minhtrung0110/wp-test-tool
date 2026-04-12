import { useEffect, useState } from 'react'
import { Plus, Tag, Pencil, Trash2 } from 'lucide-react'
import { useAppStore, type Page, type TestStatus, type HttpStatus } from '../store'
import { ConfirmDialog } from './ConfirmDialog'

function getPageUrl(domain: string, slug: string): string {
  const d = domain.replace(/\/$/, '')
  const s = slug.startsWith('/') ? slug : `/${slug}`
  return d ? `${d}${s}` : slug
}

function StatusBar({ status }: { status: TestStatus }) {
  const color =
    status === 'tested'
      ? 'bg-success'
      : status === 'error'
        ? 'bg-error-color'
        : 'bg-outline-variant/30'
  return <div className={`w-[3px] self-stretch rounded-full flex-shrink-0 ${color}`} />
}

function HttpBadge({ status }: { status: HttpStatus }) {
  if (!status) return null
  if (status === 'checking')
    return (
      <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-surface-container animate-pulse text-on-surface-variant">
        …
      </span>
    )
  if (status === 'error')
    return (
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-error-container/40 text-error-color">
        ERR
      </span>
    )
  const ok = (status as number) < 400
  return (
    <span
      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
        ok ? 'bg-success/10 text-success' : 'bg-error-container/40 text-error-color'
      }`}
    >
      {status}
    </span>
  )
}

function PageItem({ page }: { page: Page }) {
  const {
    activePageId,
    setActivePageId,
    setCurrentUrl,
    testState,
    notes,
    httpStatus,
    domain,
    openEditModal,
    deletePage,
    setDialogOpen,
  } = useAppStore()

  const [showConfirm, setShowConfirm] = useState(false)
  const [hovered, setHovered] = useState(false)

  // Sync local dialog state with store so App.tsx can hide the WebContentsView
  useEffect(() => {
    setDialogOpen(showConfirm)
    return () => setDialogOpen(false)
  }, [showConfirm])

  const isActive = activePageId === page.id
  const status: TestStatus = testState[page.id] ?? 'untested'
  const hasNote = !!(notes[page.id]?.trim())
  const httpStat: HttpStatus = httpStatus[page.id] ?? null

  function handleClick() {
    const url = getPageUrl(domain, page.slug)
    setActivePageId(page.id)
    setCurrentUrl(url)
    window.api.webviewNavigate(url)
  }

  return (
    <>
      <div
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={[
          'relative flex items-stretch gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all duration-100',
          isActive
            ? 'bg-primary/[0.08] ring-1 ring-inset ring-primary/20'
            : 'hover:bg-surface-container',
          hasNote ? 'pl-1 border-l-2 border-error-color' : 'border-l-2 border-transparent',
        ].join(' ')}
      >
        <StatusBar status={status} />

        <div className="flex-1 min-w-0">
          <p
            className={`text-[13px] font-medium truncate leading-snug ${
              isActive ? 'text-primary' : 'text-on-surface'
            }`}
          >
            {page.title}
          </p>
          <p className="text-[11px] font-mono text-on-surface-variant/50 truncate mt-0.5">
            {page.slug}
          </p>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {hovered || isActive ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openEditModal(page.id)
                }}
                className="p-1 rounded hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors"
                title="Edit"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowConfirm(true)
                }}
                className="p-1 rounded hover:bg-error-container/30 text-on-surface-variant hover:text-error-color transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          ) : (
            <HttpBadge status={httpStat} />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Delete page?"
        description={`Remove "${page.title}" from the list. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          deletePage(page.id)
          setShowConfirm(false)
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}

export function Sidebar() {
  const {
    pages,
    categories,
    categoryFilter,
    setCategoryFilter,
    testState,
    notes,
    openAddModal,
    openCategoryModal,
    resetAll,
    domain,
    httpStatus,
    setHttpStatus,
    clearHttpStatus,
    setDialogOpen,
  } = useAppStore()

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [checking404, setChecking404] = useState(false)

  // Sync local dialog state with store so App.tsx can hide the WebContentsView
  useEffect(() => {
    setDialogOpen(showResetConfirm)
    return () => setDialogOpen(false)
  }, [showResetConfirm])

  const filteredPages = categoryFilter
    ? pages.filter((p) => p.category === categoryFilter)
    : pages

  const totalTested = Object.values(testState).filter((s) => s === 'tested').length
  const totalErrors = Object.values(testState).filter((s) => s === 'error').length
  const totalNotes = Object.values(notes).filter((n) => n?.trim()).length
  const progressPct =
    pages.length > 0 ? Math.round((totalTested / pages.length) * 100) : 0

  function catCount(cat: string) {
    return pages.filter((p) => p.category === cat).length
  }

  async function handleCheck404() {
    if (checking404 || pages.length === 0 || !domain) return
    setChecking404(true)
    clearHttpStatus()
    pages.forEach((p) => setHttpStatus(p.id, 'checking'))
    const urls = pages.map((p) => ({ id: p.id, url: getPageUrl(domain, p.slug) }))
    await window.api.checkPagesStatus(urls)
    setChecking404(false)
  }

  return (
    <aside className="w-[260px] bg-surface-container-low flex flex-col shrink-0 overflow-hidden border-r border-outline-variant/10">
      {/* ── Top action buttons ──────────────────────────── */}
      <div className="px-3 pt-3 pb-2 flex gap-2 shrink-0">
        {/* Add New Page */}
        <button
          onClick={openAddModal}
          className="flex-1 flex items-center justify-center gap-1.5 h-8
            bg-primary hover:bg-primary-container text-white rounded-lg
            text-[12px] font-medium transition-colors active:scale-[0.97]"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Add New Page</span>
        </button>

        {/* Add Category */}
        <button
          onClick={openCategoryModal}
          className="flex-1 flex items-center justify-center gap-1.5 h-8
            bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface
            border border-outline-variant/30 rounded-lg
            text-[12px] font-medium transition-colors active:scale-[0.97]"
        >
          <Tag className="w-3 h-3 shrink-0" />
          <span className="truncate">Add Category</span>
        </button>
      </div>

      {/* ── Progress ───────────────────────────────────── */}
      <div className="px-4 pt-2 pb-2 border-b border-outline-variant/10 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-on-surface-variant">
              <span className="font-semibold text-on-surface text-[13px]">{totalTested}</span>
              /{pages.length} tested
            </span>
            {totalErrors > 0 && (
              <span className="font-medium text-error-color">{totalErrors} errors</span>
            )}
            {totalNotes > 0 && (
              <span className="text-on-surface-variant/50">{totalNotes} notes</span>
            )}
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-[11px] text-on-surface-variant/50 hover:text-error-color transition-colors px-1"
            title="Reset all"
          >
            Reset
          </button>
        </div>

        <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-[10px] text-right text-on-surface-variant/40 mt-0.5">{progressPct}%</p>
      </div>

      {/* ── Category filter pills ─────────────────────── */}
      {categories.length > 0 && (
        <div className="px-3 py-2 flex flex-wrap gap-1.5 shrink-0 border-b border-outline-variant/10">
          <button
            onClick={() => setCategoryFilter(null)}
            className={[
              'px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors',
              !categoryFilter
                ? 'bg-primary text-white'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
            ].join(' ')}
          >
            All {pages.length}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={[
                'px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors',
                categoryFilter === cat
                  ? 'bg-primary text-white'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
              ].join(' ')}
            >
              {cat} {catCount(cat)}
            </button>
          ))}
        </div>
      )}

      {/* ── Check 404 button ──────────────────────────── */}
      {pages.length > 0 && domain && (
        <div className="px-3 py-2 shrink-0 border-b border-outline-variant/10">
          <button
            onClick={handleCheck404}
            disabled={checking404}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[12px]
              text-on-surface-variant border border-outline-variant/30 rounded-lg
              hover:bg-surface-container hover:text-on-surface transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking404 ? (
              <>
                <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                Checking...
              </>
            ) : (
              'Check 404'
            )}
          </button>
        </div>
      )}

      {/* ── Page list ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-0.5">
        {filteredPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center text-on-surface-variant/40">
            <p className="text-[13px]">No pages yet</p>
            <p className="text-[11px] mt-1">Click "Add New Page" to get started</p>
          </div>
        ) : (
          filteredPages.map((page) => <PageItem key={page.id} page={page} />)
        )}
      </div>

      <ConfirmDialog
        open={showResetConfirm}
        title="Reset all?"
        description="Clears all test statuses, notes, and HTTP check results. Your page list is kept."
        confirmLabel="Reset"
        onConfirm={() => {
          resetAll()
          window.api.webviewNavigate('about:blank')
          setShowResetConfirm(false)
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </aside>
  )
}
