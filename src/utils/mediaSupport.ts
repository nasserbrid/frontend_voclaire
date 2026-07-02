export function getDictaphoneUnsupportedReason(): string | null {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
    return "Cette fonctionnalité nécessite un ordinateur (Chrome ou Edge) — non disponible sur mobile."
  }

  const ua = navigator.userAgent
  const isFirefox = /firefox/i.test(ua)
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)

  if (isFirefox) {
    return "Firefox ne supporte pas le partage de l'audio d'un onglet. Utilisez Chrome ou Edge pour enregistrer une réunion."
  }
  if (isSafari) {
    return "Safari ne supporte pas la capture audio d'onglet. Utilisez Chrome ou Edge pour enregistrer une réunion."
  }

  return null
}
