import { Terminal, Zap } from 'lucide-react'

interface LoadingScreenProps {
  progress?: number
  statusMessage?: string
}

function GridDecoration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 4 }, (_, col) => (
          <rect
            key={`${row}-${col}`}
            x={col * 20 + 6}
            y={row * 20 + 6}
            width="8"
            height="8"
            rx="2"
            fill="#c3c6d7"
            opacity="0.6"
          />
        ))
      )}
    </svg>
  )
}

export function LoadingScreen({
  progress = 68,
  statusMessage = 'Securing environment keys...'
}: LoadingScreenProps) {
  return (
    <div
      className="relative w-full h-screen bg-surface flex flex-col overflow-hidden select-none"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,74,198,0.03) 0%, rgba(0,74,198,0) 70%)'
      }}
    >
      {/* Top-left decorative grid */}
      <div className="absolute left-14 top-14 pointer-events-none" aria-hidden="true">
        <GridDecoration />
      </div>

      {/* Bottom-right decorative circle */}
      <div
        className="absolute bottom-32 right-12 size-64 rounded-full border border-dashed border-primary opacity-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Main centered content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-12 relative z-10">

        {/* Logo Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white border border-outline-variant/10 rounded-xl shadow-ambient p-px size-24 flex items-center justify-center">
            <Zap className="w-[22px] h-9 text-primary" strokeWidth={2} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="font-display font-extrabold text-[30px] leading-9 tracking-[-0.75px] text-on-surface whitespace-nowrap">
              Testing Console
            </h1>
            <p className="font-sans text-sm font-normal tracking-[2.8px] uppercase text-on-surface-variant whitespace-nowrap">
              Architectural Testing Suite
            </p>
            <p className="font-sans text-xs font-normal tracking-normal uppercase text-on-surface-variant whitespace-nowrap">
              Nguyen Duc Minh Trung - minhtrungdev.site
            </p>
          </div>
        </div>

        {/* Loader Section */}
        <div className="relative flex items-center justify-center size-[120px]">
          {/* Outer decorative ring (140×140, centred via -10px offset) */}
          <div
            className="absolute rounded-full border border-outline-variant/15 pointer-events-none"
            style={{ inset: '-10px' }}
            aria-hidden="true"
          />
          {/* Spinning arc */}
          <div
            className="size-[120px] rounded-full animate-spin"
            style={{
              border: '2px solid rgba(195,198,215,0.15)',
              borderTopColor: '#004ac6',
              animationDuration: '1.4s',
              animationTimingFunction: 'linear'
            }}
          />
          {/* Inner core — centred inside the 120px ring */}
          <div className="absolute inset-[40px] rounded-full bg-primary/10 flex items-center justify-center">
            <div className="size-2 rounded-full bg-primary" />
          </div>
        </div>

        {/* Status Section */}
        <div className="flex flex-col items-center gap-2">
          {/* Version / phase badge */}
          <div className="bg-surface-container-low border border-outline-variant/15 rounded-full px-[17px] py-[7px] flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-primary-fixed-dim flex-shrink-0" />
            <span className="font-sans font-medium text-xs text-on-surface-variant whitespace-nowrap">
              V2.4.0 Initializing...
            </span>
          </div>

          {/* Diagnostic stats row */}
          <div className="flex items-center gap-6 pt-4 opacity-40">
            <div className="flex flex-col items-center gap-1">
              <span className="font-sans text-[10px] tracking-[1px] uppercase text-on-surface-variant">
                Network
              </span>
              <span className="font-display font-bold text-xs text-on-surface">24ms</span>
            </div>
            <div className="w-px h-6 bg-outline-variant/30" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-sans text-[10px] tracking-[1px] uppercase text-on-surface-variant">
                Status
              </span>
              <span className="font-display font-bold text-xs text-on-surface">Optimal</span>
            </div>
            <div className="w-px h-6 bg-outline-variant/30" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-sans text-[10px] tracking-[1px] uppercase text-on-surface-variant">
                Engine
              </span>
              <span className="font-display font-bold text-xs text-on-surface">V8-Turbo</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Aesthetic Utility Panel (The Tray) ───────────────────── */}
      <div className="panel-blur border-t border-outline-variant/10 h-24 flex items-center justify-between px-8 relative z-10 flex-shrink-0">
        {/* System log info */}
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-lg size-10 flex items-center justify-center flex-shrink-0 shadow-ambient">
            <Terminal className="w-[17px] h-[13px] text-on-surface-variant" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-display font-bold text-[10px] tracking-[1px] uppercase text-on-surface-variant">
              System Log
            </span>
            <span className="font-sans text-xs text-on-surface opacity-70">{statusMessage}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="bg-surface-container-highest w-32 h-1 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-display font-bold text-[10px] text-primary whitespace-nowrap">
            {progress}%
          </span>
        </div>
      </div>

      {/* ── Minimal footer ───────────────────────────────────────── */}
      <div className="bg-surface-container-low border-t border-outline-variant/15 flex items-center justify-between px-6 py-2 relative z-10 flex-shrink-0">
        <span className="font-sans text-[11px] tracking-[-0.6px] uppercase text-on-surface-variant/70">
          System Status: Operational | Latency: 24ms
        </span>
        <div className="flex items-center gap-4">
          {['Terms', 'Privacy', 'Support'].map((label) => (
            <span
              key={label}
              className="font-sans text-[11px] tracking-[-0.6px] uppercase text-on-surface-variant/70 cursor-pointer hover:text-on-surface-variant transition-colors"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
