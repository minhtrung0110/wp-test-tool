import { useState, useRef, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, GripVertical, Trash2, AlertTriangle, Plus } from 'lucide-react'
import { useAppStore } from '../store'

// ── Category list item ────────────────────────────────────────────

function CategoryItem({
  name,
  onDelete,
}: {
  name: string
  onDelete: () => void
}) {
  const isSystem = name === 'General'

  return (
    <div className="flex items-center justify-between px-3 py-3 rounded-lg group hover:bg-surface-container transition-colors">
      <div className="flex items-center gap-3">
        <GripVertical className="w-3.5 h-3.5 text-on-surface-variant/25 shrink-0" />
        <span className="text-[14px] font-medium text-on-surface">{name}</span>
      </div>

      {isSystem ? (
        /* SYSTEM badge — cannot be deleted */
        <div className="border border-outline-variant/20 rounded px-[9px] py-[3px]">
          <span className="text-[10px] font-semibold tracking-[1px] uppercase text-on-surface-variant/40">
            SYSTEM
          </span>
        </div>
      ) : (
        /* Delete button — visible on hover */
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 rounded
            text-on-surface-variant hover:text-error-color hover:bg-error-container/20
            transition-all duration-150"
          title={`Delete "${name}"`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────

export function ManageCategoriesModal() {
  const { categories, categoryModalOpen, closeCategoryModal, addCategory, deleteCategory } =
    useAppStore()

  const [newName, setNewName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (categoryModalOpen) setNewName('')
  }, [categoryModalOpen])

  function handleAdd() {
    const name = newName.trim()
    if (!name || categories.includes(name)) return
    addCategory(name)
    setNewName('')
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <Dialog.Root open={categoryModalOpen} onOpenChange={(v) => !v && closeCategoryModal()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-[2px] bg-[rgba(25,28,30,0.2)]">
          {/* Modal container (inside overlay so it centers) */}
          <Dialog.Content
            className="w-[448px] bg-surface-container-lowest rounded-2xl overflow-hidden
              shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border border-outline-variant/10"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* ── Header ──────────────────────────────────────── */}
            <div className="border-b border-outline-variant/10 pb-6 pt-6 px-6">
              <div className="flex items-start justify-between mb-2">
                <Dialog.Title className="font-display font-extrabold text-[20px] leading-7 tracking-[-0.5px] text-on-surface">
                  Manage Categories
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Dialog.Close>
              </div>
              <Dialog.Description className="text-[12px] text-on-surface-variant leading-[1.625]">
                Organize your test pages into functional groups for better visibility across
                environments.
              </Dialog.Description>
            </div>

            {/* ── Category list ─────────────────────────────── */}
            <div className="max-h-[256px] overflow-y-auto px-6 py-4">
              <div className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <CategoryItem
                    key={cat}
                    name={cat}
                    onDelete={() => deleteCategory(cat)}
                  />
                ))}
                {categories.length === 0 && (
                  <p className="text-[13px] text-on-surface-variant/40 text-center py-4">
                    No categories yet.
                  </p>
                )}
              </div>
            </div>

            {/* ── Warning callout ───────────────────────────── */}
            <div className="mx-6 mb-0">
              <div
                className="flex gap-3 items-start p-[17px] rounded-xl"
                style={{
                  background: 'rgba(255, 218, 214, 0.4)',
                  border: '1px solid rgba(255, 218, 214, 0.5)',
                }}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-on-error-container shrink-0 mt-[1px]" />
                <p className="text-[11px] font-medium text-on-error-container leading-[1.25]">
                  Deleting a category will move its pages to{' '}
                  <span className="font-semibold">'General'</span>. This action cannot be undone.
                </p>
              </div>
            </div>

            {/* ── New Category input + Done ─────────────────── */}
            <div className="flex flex-col gap-4 p-6">
              {/* Input row */}
              <div className="flex gap-3 items-end">
                {/* Input wrapper */}
                <div className="flex-1 relative">
                  <label className="absolute top-0 left-1 text-[10px] font-semibold tracking-[1px] uppercase text-on-surface-variant">
                    New Category Name
                  </label>
                  <div className="mt-5 bg-surface-container-low rounded-t-lg overflow-hidden border-b-2 border-outline-variant focus-within:border-primary transition-colors px-3 pb-3.5 pt-2.5">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="e.g. Authentication"
                      className="w-full bg-transparent text-[14px] text-on-surface outline-none
                        placeholder:text-on-surface-variant/40"
                    />
                  </div>
                </div>

                {/* Plus button */}
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!newName.trim() || categories.includes(newName.trim())}
                  className="relative size-10 rounded-full bg-primary text-white flex items-center justify-center
                    shrink-0 disabled:opacity-40 disabled:cursor-not-allowed
                    hover:bg-primary-container active:scale-95 transition-all
                    shadow-[0px_10px_15px_-3px_rgba(0,74,198,0.2),0px_4px_6px_-4px_rgba(0,74,198,0.2)]"
                  title="Add category"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Done button */}
              <div className="flex justify-end pt-4 border-t border-outline-variant/10">
                <button
                  onClick={closeCategoryModal}
                  className="relative px-8 py-3 rounded-full text-[14px] font-semibold text-white
                    bg-gradient-to-br from-primary to-primary-container
                    shadow-[0px_20px_25px_-5px_rgba(0,74,198,0.2),0px_8px_10px_-6px_rgba(0,74,198,0.2)]
                    hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
