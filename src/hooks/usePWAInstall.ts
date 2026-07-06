import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type IOSWindow = Window & { MSStream?: unknown }
type IOSNavigator = Navigator & { standalone?: boolean }

export type PWAPlatform = 'ios' | 'android' | 'desktop' | 'unsupported'

interface PWAInstallReturn {
  canInstall: boolean
  isInstalled: boolean
  platform: PWAPlatform
  showIOSGuide: boolean
  triggerInstall(): Promise<void>
  dismissIOSGuide(): void
}

export function usePWAInstall(): PWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as IOSWindow).MSStream
  const isAndroid = /Android/.test(ua)
  const platform: PWAPlatform = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop'

  const isInstalled =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as IOSNavigator).standalone === true

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const canInstall = !isInstalled && (platform === 'ios' || !!deferredPrompt)

  const triggerInstall = async () => {
    if (platform === 'ios') {
      setShowIOSGuide(true)
      return
    }
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setDeferredPrompt(null)
    }
  }

  return {
    canInstall,
    isInstalled,
    platform,
    showIOSGuide,
    triggerInstall,
    dismissIOSGuide: () => setShowIOSGuide(false),
  }
}
