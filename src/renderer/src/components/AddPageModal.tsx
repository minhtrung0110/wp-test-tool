import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Trash2, ChevronDown, ShieldCheck, GitBranch } from 'lucide-react'
import { useAppStore } from '../store'
import { ConfirmDialog } from './ConfirmDialog'

export function AddPageModal() {
  const {
    pages,
    categories,
    pageModalOpen,
    pageModalEditId,
    closePageModal,
    addPage,
    updatePage,
    deletePage,
  } = useAppStore()

  const isEdit = !!pageModalEditId
  const editPage = pageModalEditId ? pages.find((p) => p.id === pageModalEditId) : null

  const [title, setTitle] = useState('')
  // slug input stores path WITHOUT leading slash (per Figma design with "/" prefix label)
  const [slugInput, setSlugInput] = useState('')
  const [category, setCategory] = useState('General')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (pageModalOpen) {
      if (editPage) {
        setTitle(editPage.title)
        // Strip leading slash for the input field
        setSlugInput(editPage.slug.replace(/^\//, ''))
        setCategory(editPage.category)
      } else {
        setTitle('')
        setSlugInput('')
        setCategory(categories[0] ?? 'General')
      }
    }
  }, [pageModalOpen, pageModalEditId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    const finalSlug = `/${slugInput.trim().replace(/^\/+/, '') || ''}`

    if (isEdit && pageModalEditId) {
      updatePage(pageModalEditId, { title: trimmedTitle, slug: finalSlug, category })
    } else {
      addPage({ title: trimmedTitle, slug: finalSlug, category })
    }
    closePageModal()
  }

  function handleDelete() {
    if (pageModalEditId) deletePage(pageModalEditId)
    setShowDeleteConfirm(false)
    closePageModal()
  }

  return (
    <>
      <Dialog.Root open={pageModalOpen} onOpenChange={(v) => !v && closePageModal()}>
        <Dialog.Portal>
          {/* Overlay */}
          <Dialog.Overlay className="fixed inset-0 z-50 backdrop-blur-[1px] bg-[rgba(25,28,30,0.2)]" />

          {/* Modal */}
          <Dialog.Content
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-[512px] bg-surface-container-lowest rounded-xl overflow-hidden
              border border-outline-variant/15 shadow-[0px_12px_32px_0px_rgba(0,74,198,0.05)]"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* ── Header ──────────────────────────────────────── */}
            <div className="flex items-start justify-between pb-4 pt-8 px-8">
              <div className="flex flex-col gap-1">
                <Dialog.Title className="font-display font-extrabold text-[24px] leading-8 tracking-[-0.6px] text-on-surface">
                  {isEdit ? 'Edit Page' : 'Add New Page'}
                </Dialog.Title>
                <Dialog.Description className="text-[14px] text-on-surface-variant leading-5">
                  {isEdit
                    ? 'Update the page details below.'
                    : 'Define a new page for the test suite.'}
                </Dialog.Description>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* CMD+N badge */}
                {!isEdit && (
                  <div className="bg-surface-container border border-outline-variant/30 rounded px-[9px] py-[5px]">
                    <span className="text-[10px] font-semibold tracking-[1px] uppercase text-on-surface-variant">
                      CMD+N
                    </span>
                  </div>
                )}
                {/* Close button */}
                <Dialog.Close asChild>
                  <button className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            {/* ── Form ────────────────────────────────────────── */}
            <form id="page-form" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6 px-8 py-6">
                {/* Page Title */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold tracking-[0.6px] uppercase text-on-surface-variant">
                    Page Title
                  </label>
                  <div className="bg-surface-container-lowest border-b-2 border-outline-variant overflow-hidden pb-3 pt-[10px] focus-within:border-primary transition-colors">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Product List"
                      required
                      autoFocus
                      className="w-full bg-transparent text-[16px] font-medium text-on-surface
                        outline-none placeholder:text-on-surface-variant/40"
                    />
                  </div>
                </div>

                {/* Slug / Path */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold tracking-[0.6px] uppercase text-on-surface-variant">
                    Slug / Path
                  </label>
                  <div className="flex items-center">
                    {/* "/" prefix label */}
                    <span className="text-[14px] font-mono text-on-surface-variant pr-1 pb-3 pt-[10px] border-b-2 border-outline-variant shrink-0">
                      /
                    </span>
                    <div className="flex-1 border-b-2 border-outline-variant overflow-hidden pb-3 pt-[10px] focus-within:border-primary transition-colors">
                      <input
                        type="text"
                        value={slugInput}
                        onChange={(e) => setSlugInput(e.target.value)}
                        placeholder="hotels"
                        className="w-full bg-transparent text-[14px] font-mono text-on-surface
                          outline-none placeholder:text-on-surface-variant/40"
                      />
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold tracking-[0.6px] uppercase text-on-surface-variant">
                    Category
                  </label>
                  <div className="relative border-b-2 border-outline-variant focus-within:border-primary transition-colors pb-[10px] pt-2">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-transparent text-[16px] font-medium text-on-surface
                        outline-none appearance-none cursor-pointer pr-8"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* ── Footer ──────────────────────────────────────── */}
              <div className="flex items-center justify-end gap-4 pb-8 pt-4 px-8">
                {isEdit && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 mr-auto text-[13px] text-error-color
                      hover:opacity-80 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}

                {/* Cancel */}
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-6 py-2 rounded-full text-[14px] font-semibold text-primary
                      hover:bg-primary/8 transition-colors"
                  >
                    Cancel
                  </button>
                </Dialog.Close>

                {/* Submit */}
                <button
                  type="submit"
                  className="relative px-8 py-2 rounded-full text-[14px] font-semibold text-white
                    bg-gradient-to-br from-primary to-primary-container
                    shadow-[0px_10px_15px_-3px_rgba(0,74,198,0.2),0px_4px_6px_-4px_rgba(0,74,198,0.2)]
                    hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  {isEdit ? 'Save Changes' : 'Create Page'}
                </button>
              </div>
            </form>

            {/* ── Utility Tray ─────────────────────────────────── */}
            <div className="panel-blur border-t border-outline-variant/10 flex items-center justify-between px-8 py-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-on-surface-variant/60" />
                  <span className="text-[10px] font-medium text-on-surface-variant">
                    Auto-validating paths
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GitBranch className="w-2.5 h-2.5 text-on-surface-variant/60" />
                  <span className="text-[10px] font-medium text-on-surface-variant">
                    Linked to domain
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-success" />
                <span className="text-[10px] font-medium text-success">System Ready</span>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete page?"
        description={`Remove "${editPage?.title}" from the list. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}
