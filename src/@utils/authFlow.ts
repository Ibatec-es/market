export type PendingAuthMode = 'login' | 'signup'

const pendingAuthStorageKey = 'auth_pending_sso'
const pendingCallbackUrlStorageKey = 'auth_callback_url'

export function getPendingAuthMode(): PendingAuthMode | null {
  if (typeof window === 'undefined') return null

  const value = sessionStorage.getItem(pendingAuthStorageKey)
  if (value === 'login' || value === 'signup') return value

  return null
}

export function setPendingAuthMode(mode: PendingAuthMode): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(pendingAuthStorageKey, mode)
}

export function clearPendingAuthMode(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(pendingAuthStorageKey)
}

export function hasPendingAuthMode(): boolean {
  return getPendingAuthMode() !== null
}

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
