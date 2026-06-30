const BACKEND_URL = import.meta.env.VITE_BACKEND_VOCLAIRE_URL

export async function createCheckout(billingPeriod: 'monthly' | 'annual'): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/payments/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ billing_period: billingPeriod }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error((error as { detail?: string }).detail ?? 'Erreur lors du paiement')
  }
  const data = await response.json()
  return (data as { url: string }).url
}

export async function createPortalSession(): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/payments/portal`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error((error as { detail?: string }).detail ?? 'Erreur portail')
  }
  const data = await response.json()
  return (data as { url: string }).url
}
