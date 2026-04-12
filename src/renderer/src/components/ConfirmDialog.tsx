import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-[360px] bg-surface-container-low rounded-xl p-6 shadow-float
            border border-outline-variant/15"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-1.5 rounded-lg bg-error-container/30 shrink-0">
              <AlertTriangle className="w-4 h-4 text-error-color" />
            </div>
            <div>
              <Dialog.Title className="text-[14px] font-semibold text-on-surface">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[12px] text-on-surface-variant leading-relaxed">
                {description}
              </Dialog.Description>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-[13px] text-on-surface-variant rounded-lg
                border border-outline-variant/30 hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-3 py-1.5 text-[13px] text-white bg-error-color rounded-lg
                hover:opacity-90 transition-opacity"
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
