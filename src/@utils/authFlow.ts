export type PendingAuthMode = 'login' | 'signup'

const pendingCallbackUrlStorageKey = 'auth_callback_url'

export function getPendingCallbackUrl(): string | null {
  if (typeof window === 'undefined') return null

  return sessionStorage.getItem(pendingCallbackUrlStorageKey)
}

export function setPendingCallbackUrl(url: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(pendingCallbackUrlStorageKey, url)
}

export function clearPendingCallbackUrl(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(pendingCallbackUrlStorageKey)
}
