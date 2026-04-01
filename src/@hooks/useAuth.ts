import { useAuthStore, User } from './stores/authStore'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { authConfig } from '../config/auth.config'
import React from 'react'
import { useAccount } from 'wagmi'
import { useModal } from 'connectkit'
import { useSsiWallet } from '@context/SsiWallet'
import { useUserPreferences } from '@context/UserPreferences'
import useSsiChainGuard from './useSsiChainGuard'
import {
  clearPendingCallbackUrl,
  clearPendingAuthMode,
  getPendingCallbackUrl,
  setPendingCallbackUrl,
  setPendingAuthMode,
  type PendingAuthMode
} from '@utils/authFlow'

/* ---------------- ENDPOINTS ---------------- */

const getEndpoints = (issuer: string) => {
  const match = issuer.match(/(.*\/application\/o\/)[^/]+\/?$/)

  const baseUrl = match
    ? match[1].replace(/\/$/, '')
    : issuer.replace(/\/[^/]+?\/?$/, '')

  return {
    authorize: `${baseUrl}/authorize/`,
    token: `${baseUrl}/token/`,
    endSession: `${issuer.replace(/\/$/, '')}/end-session/`
  }
}

/* ---------------- OIDC ---------------- */

class OIDCProvider {
  private getConfig() {
    return authConfig.oidc
  }

  async signup(): Promise<User> {
    const config = this.getConfig()
    const endpoints = getEndpoints(config.issuer)

    const codeVerifier = this.generateCodeVerifier()
    const codeChallenge = await this.generateCodeChallenge(codeVerifier)

    sessionStorage.setItem('oidc_pkce_code_verifier', codeVerifier)

    const authUrl =
      `${endpoints.authorize}?` +
      `client_id=${config.clientId}&` +
      `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
      `response_type=code&` +
      `scope=${config.scope}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256&` +
      `prompt=create`

    window.location.href = authUrl
    return new Promise(() => {})
  }

  async login(): Promise<User> {
    const config = this.getConfig()
    const endpoints = getEndpoints(config.issuer)

    const codeVerifier = this.generateCodeVerifier()
    const codeChallenge = await this.generateCodeChallenge(codeVerifier)

    sessionStorage.setItem('oidc_pkce_code_verifier', codeVerifier)

    const authUrl =
      `${endpoints.authorize}?` +
      `client_id=${config.clientId}&` +
      `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
      `response_type=code&` +
      `scope=${config.scope}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`

    window.location.href = authUrl
    return new Promise(() => {})
  }

  async logout(): Promise<void> {
    try {
      const config = this.getConfig()
      const endpoints = getEndpoints(config.issuer)

      const redirectUri = encodeURIComponent(
        `${window.location.origin}/auth/login`
      )

      let idTokenHint = ''
      const tokens = localStorage.getItem('oidc_tokens')

      if (tokens) {
        try {
          const parsed = JSON.parse(tokens)
          if (parsed.id_token) {
            idTokenHint = `&id_token_hint=${encodeURIComponent(
              parsed.id_token
            )}`
          }
        } catch (e) {
          console.warn('Could not parse tokens', e)
        }
      }

      const state = Math.random().toString(36).substring(2)
      sessionStorage.setItem('oidc_logout_state', state)

      const logoutUrl =
        `${endpoints.endSession}?` +
        `client_id=${config.clientId}&` +
        `post_logout_redirect_uri=${redirectUri}&` +
        `state=${state}` +
        idTokenHint

      sessionStorage.setItem('oidc_logout_pending', 'true')
      window.location.href = logoutUrl
    } catch (err) {
      console.error('Logout error:', err)
      toast.error('Logout failed')
    }
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const hash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(verifier)
    )

    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }
}
const oidcProvider = new OIDCProvider()

const clearOidcStorage = () => {
  localStorage.removeItem('oidc_session')
  localStorage.removeItem('oidc_tokens')
  sessionStorage.removeItem('oidc_pkce_code_verifier')
  sessionStorage.removeItem('oidc_processing')
  sessionStorage.removeItem('oidc_logout_state')
  sessionStorage.removeItem('oidc_logout_pending')
  clearPendingAuthMode()
  clearPendingCallbackUrl()
}

/* ---------------- HOOK ---------------- */

export const useAuth = () => {
  const {
    user,
    isLoading,
    setUser,
    setLoading,
    logout: storeLogout
  } = useAuthStore()

  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { setOpen } = useModal()
  const { sessionToken } = useSsiWallet()
  const { setShowSsiWalletModule } = useUserPreferences()
  const { ensureAllowedChainForSsi } = useSsiChainGuard()

  /* -------- Restore Session -------- */

  React.useEffect(() => {
    try {
      const session = localStorage.getItem('oidc_session')
      if (session) setUser(JSON.parse(session))
    } catch {}
  }, [])

  /* -------- Handle Logout Return -------- */
  React.useEffect(() => {
    const isLogoutPending =
      sessionStorage.getItem('oidc_logout_pending') === 'true'

    if (isLogoutPending) {
      clearOidcStorage()

      storeLogout()

      if (window.location.pathname !== '/auth/login') {
        router.replace('/auth/login')
      }
    }
  }, [router, storeLogout])

  /* -------- Callback -------- */

  const handleOIDCCallback = async (code: string) => {
    if (sessionStorage.getItem('oidc_processing')) return

    sessionStorage.setItem('oidc_processing', 'true')

    try {
      const config = authConfig.oidc
      const endpoints = getEndpoints(config.issuer)

      const res = await fetch(endpoints.token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: config.clientId,
          client_secret: config.clientSecret || '',
          code,
          redirect_uri: config.redirectUri,
          code_verifier: sessionStorage.getItem('oidc_pkce_code_verifier') || ''
        })
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const tokens = await res.json()
      const payload = JSON.parse(atob(tokens.id_token.split('.')[1]))

      const userData: User = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: `https://ui-avatars.com/api/?name=${payload.name}`,
        walletAddress: address,
        isOnboarded: false,
        authProvider: 'oidc'
      }

      localStorage.setItem('oidc_session', JSON.stringify(userData))
      localStorage.setItem('oidc_tokens', JSON.stringify(tokens))
      const redirectTo = getPendingCallbackUrl() || '/profile'
      clearPendingAuthMode()
      clearPendingCallbackUrl()

      window.history.replaceState({}, '', '/')

      setUser(userData)
      router.replace(redirectTo)
    } catch (err) {
      console.error('Callback error:', err)
      clearPendingAuthMode()
      clearPendingCallbackUrl()
      toast.error('Login failed')
      router.replace('/auth/login')
    } finally {
      sessionStorage.removeItem('oidc_processing')
    }
  }

  const checkSession = async () => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) await handleOIDCCallback(code)
  }

  /* -------- Login -------- */

  const login = async (mode: PendingAuthMode = 'login') => {
    setLoading(true)
    try {
      if (mode === 'signup') {
        await oidcProvider.signup()
      } else {
        await oidcProvider.login()
      }
    } finally {
      setLoading(false)
    }
  }

  const beginOidcFlow = async (mode: PendingAuthMode) => {
    setPendingAuthMode(mode)
    const callbackUrl =
      typeof router.query.callbackUrl === 'string'
        ? router.query.callbackUrl
        : null

    if (callbackUrl) {
      setPendingCallbackUrl(callbackUrl)
    } else {
      clearPendingCallbackUrl()
    }

    if (!isConnected) {
      setOpen(true)
      return
    }

    if (!sessionToken) {
      if (!ensureAllowedChainForSsi()) {
        return
      }

      setShowSsiWalletModule(true)
      return
    }

    await login(mode)
  }

  /* -------- Logout -------- */

  const logout = async () => {
    setLoading(true)

    try {
      if (user?.authProvider === 'oidc') {
        await oidcProvider.logout()
        return
      }

      clearOidcStorage()
      storeLogout()

      router.replace('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    beginOidcFlow,
    logout,
    checkSession,
    authEnabled: authConfig.enabled
  }
}
