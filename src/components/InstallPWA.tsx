import { usePWAInstall } from '../hooks/usePWAInstall'

function ShareIconSVG() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v12m0-12L8.5 5.5M12 2l3.5 3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 8H5a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V9a1 1 0 00-1-1h-3" />
    </svg>
  )
}

function AddToHomeIconSVG() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path strokeLinecap="round" d="M12 8v8M8 12h8" />
    </svg>
  )
}

function IOSInstallGuide({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col pointer-events-auto">
      <div className="flex-1 bg-black/65 backdrop-blur-sm" onClick={onDismiss} />

      <div className="bg-slate-900 border-t border-slate-700 px-5 pt-5 pb-3">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white font-semibold text-base">Installer Voclaire</p>
            <p className="text-slate-400 text-sm mt-0.5">
              Accédez à l'app depuis votre écran d'accueil
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="ml-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 text-sm"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/70 rounded-xl px-4 py-3 mb-2">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <ShareIconSVG />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Étape 1</p>
            <p className="text-slate-300 text-sm">
              Tapez l'icône{' '}
              <span className="text-emerald-400 font-medium">Partager</span>
              {' '}en bas de Safari
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/70 rounded-xl px-4 py-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <AddToHomeIconSVG />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Étape 2</p>
            <p className="text-slate-300 text-sm">
              Sélectionnez{' '}
              <span className="text-emerald-400 font-medium">
                « Ajouter à l'écran d'accueil »
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 pb-2">
          <p className="text-slate-500 text-xs">Le bouton Partager se trouve juste ici</p>
          <div className="text-emerald-400 animate-bounce">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="w-16 h-0.5 rounded-full bg-slate-700" />
        </div>
      </div>
    </div>
  )
}

export function InstallPWAButton() {
  const { canInstall, platform, showIOSGuide, triggerInstall, dismissIOSGuide } = usePWAInstall()

  if (!canInstall) return null

  return (
    <>
      <button
        onClick={triggerInstall}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-colors"
        title={platform === 'ios' ? "Installer sur iPhone" : "Installer l'application"}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
        </svg>
        <span className="hidden sm:inline">Installer</span>
      </button>

      {platform === 'ios' && showIOSGuide && (
        <IOSInstallGuide onDismiss={dismissIOSGuide} />
      )}
    </>
  )
}
