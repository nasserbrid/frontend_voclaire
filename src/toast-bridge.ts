let _pending: string | null = null

export function setPendingToast(message: string) {
  _pending = message
}

export function consumePendingToast(): string | null {
  const msg = _pending
  _pending = null
  return msg
}
