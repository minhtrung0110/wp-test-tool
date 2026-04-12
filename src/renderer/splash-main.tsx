import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './src/index.css'
import { LoadingScreen } from './src/components/LoadingScreen'

const STATUS_MESSAGES = [
  'Initializing workspace...',
  'Loading configuration...',
  'Connecting to renderer...',
  'Securing environment keys...',
  'System ready',
]

function SplashApp() {
  const [progress, setProgress] = useState(0)
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const DURATION = 1900 // slightly under the 2s minimum gate
    const TICK = 40
    let elapsed = 0

    const timer = setInterval(() => {
      elapsed += TICK
      const pct = Math.min(Math.round((elapsed / DURATION) * 100), 99)
      setProgress(pct)
      setMsgIndex(Math.min(Math.floor(pct / 20), STATUS_MESSAGES.length - 1))
      if (elapsed >= DURATION) clearInterval(timer)
    }, TICK)

    return () => clearInterval(timer)
  }, [])

  return <LoadingScreen progress={progress} statusMessage={STATUS_MESSAGES[msgIndex]} />
}

createRoot(document.getElementById('splash-root')!).render(
  <StrictMode>
    <SplashApp />
  </StrictMode>
)
