import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const PWAInstallContext = createContext(null)

export function PWAInstallProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        window.matchMedia?.('(display-mode: standalone)').matches ||
        window.navigator.standalone === true

      setIsInstalled(Boolean(standalone))
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
      setCanInstall(true)
      setIsInstalled(false)
    }

    const handleInstalled = () => {
      setDeferredPrompt(null)
      setCanInstall(false)
      setIsInstalled(true)
    }

    checkInstalled()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) {
      return {
        success: false,
        message:
          'Install is not ready yet. Please wait a moment, refresh once, or use the browser install icon.',
      }
    }

    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    setDeferredPrompt(null)
    setCanInstall(false)

    return {
      success: choice.outcome === 'accepted',
      outcome: choice.outcome,
    }
  }

  const value = useMemo(
    () => ({
      canInstall,
      isInstalled,
      installApp,
    }),
    [canInstall, isInstalled]
  )

  return (
    <PWAInstallContext.Provider value={value}>
      {children}
    </PWAInstallContext.Provider>
  )
}

export function usePWAInstall() {
  const context = useContext(PWAInstallContext)

  if (!context) {
    throw new Error('usePWAInstall must be used inside PWAInstallProvider')
  }

  return context
}