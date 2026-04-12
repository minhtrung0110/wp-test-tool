import { useState } from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'

export type Theme = 'light' | 'dark' | 'system'

interface Props {
  onConfirm: (theme: Theme) => void
}

// ── Mini UI previews ──────────────────────────────────────────────────────────

function LightPreview() {
  return (
    <div className="h-[140px] bg-[#f8f9fb] p-2.5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-[rgba(0,74,198,0.2)]" />
        <div className="size-2 rounded-full bg-[#004ac6] shrink-0" />
      </div>
      <div className="flex-1 bg-white border border-[rgba(195,198,215,0.15)] rounded p-1.5 flex flex-col gap-1 overflow-hidden">
        <div className="h-1 rounded-full bg-[#edeef0] w-full" />
        <div className="h-1 rounded-full bg-[#edeef0] w-3/4" />
        <div className="h-1 rounded-full bg-[#edeef0] w-1/2" />
      </div>
    </div>
  )
}

function DarkPreview() {
  return (
    <div className="h-[140px] bg-[#0f172a] p-2.5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-[#334155]" />
        <div className="size-2 rounded-full bg-[#60a5fa] shrink-0" />
      </div>
      <div className="flex-1 bg-[#1e293b] border border-[#334155] rounded p-1.5 flex flex-col gap-1 overflow-hidden">
        <div className="h-1 rounded-full bg-[#334155] w-full" />
        <div className="h-1 rounded-full bg-[#334155] w-3/4" />
        <div className="h-1 rounded-full bg-[#334155] w-1/2" />
      </div>
    </div>
  )
}

function SystemPreview() {
  return (
    <div className="h-[140px] flex overflow-hidden">
      <div className="flex-1 bg-[#f8f9fb] p-2 flex flex-col gap-2">
        <div className="h-2 rounded-full bg-[rgba(0,74,198,0.2)] w-full" />
        <div className="flex-1 bg-white border border-[rgba(195,198,215,0.15)] rounded" />
      </div>
      <div className="flex-1 bg-[#0f172a] p-2 flex flex-col gap-2">
        <div className="h-2 rounded-full bg-[#334155] w-full" />
        <div className="flex-1 bg-[#1e293b] border border-[#334155] rounded" />
      </div>
    </div>
  )
}

// ── Option config ─────────────────────────────────────────────────────────────

const OPTIONS: {
  id: Theme
  label: string
  description: string
  icon: React.ReactNode
  Preview: React.FC
}[] = [
  {
    id: 'light',
    label: 'Light Mode',
    description: 'Clean, bright workspace',
    icon: <Sun className="w-4 h-4 text-on-surface" />,
    Preview: LightPreview,
  },
  {
    id: 'dark',
    label: 'Dark Mode',
    description: 'High-contrast, sleek',
    icon: <Moon className="w-3.5 h-3.5 text-on-surface" />,
    Preview: DarkPreview,
  },
  {
    id: 'system',
    label: 'System Default',
    description: 'Syncs with OS',
    icon: <Monitor className="w-[15px] h-3 text-on-surface" />,
    Preview: SystemPreview,
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function ThemeSelectionModal({ onConfirm }: Props) {
  const [selected, setSelected] = useState<Theme>('light')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-[rgba(25,28,30,0.1)]">
      <div className="bg-white w-[672px] rounded-xl overflow-hidden shadow-[0px_12px_32px_0px_rgba(0,74,198,0.08)]">
        <div className="flex flex-col gap-8 p-8">

          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="font-display font-extrabold text-[30px] leading-9 tracking-[-0.75px] text-on-surface text-center">
              Choose Your Workspace Aesthetic
            </h1>
            <p className="font-sans text-base text-on-surface-variant text-center">
              Personalize the visual density and tone of your professional toolset.
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-3 gap-4">
            {OPTIONS.map(({ id, label, description, icon, Preview }) => {
              const isSelected = selected === id
              return (
                <button
                  key={id}
                  onClick={() => setSelected(id)}
                  className="relative flex flex-col items-center cursor-pointer focus:outline-none"
                >
                  {/* Active-state checkmark badge */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 z-10 size-[18px] rounded-full bg-primary flex items-center justify-center shadow-[0px_4px_8px_rgba(0,74,198,0.25)]">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  )}

                  {/* Preview card with selection border */}
                  <div
                    className={`w-full mb-3 rounded-lg overflow-hidden border-2 transition-colors duration-150 ${
                      isSelected ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <Preview />
                  </div>

                  {/* Label */}
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-sans font-semibold text-base text-on-surface">
                      {label}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mt-1 font-sans text-xs text-on-surface-variant">
                    {description}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col items-center gap-4 pt-2">
            <button
              onClick={() => onConfirm(selected)}
              className="w-80 py-3 rounded-full font-sans font-semibold text-lg text-white bg-gradient-to-br from-primary to-primary-container shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              Enter Console
            </button>
            <p className="font-sans font-medium text-[11px] tracking-[1.2px] uppercase text-on-surface-variant/60">
              Preferences can be adjusted in Settings later
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
