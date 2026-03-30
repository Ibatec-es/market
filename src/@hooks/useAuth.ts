import { useAuthStore, User } from './stores/authStore'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { authConfig } from '../config/auth.config'
import React from 'react'

interface AuthProviderInterface {
  login: () => Promise<User>
  logout: () => Promise<void>
  getSession: () => Promise<User | null>
}

/* ---------------- MOCK PROVIDERS ---------------- */

class GoogleAuthProvider implements AuthProviderInterface {
  async login(): Promise<User> {
    const userData: User = {
      id: Math.random().toString(36),
      email: 'test.user@example.com',
      name: 'Test User',
      avatar: 'https://ui-avatars.com/api/?name=Test+User',
      isOnboarded: false,
      authProvider: 'google'
    }

    localStorage.setItem('mock_google_session', JSON.stringify(userData))
    return userData
  }

  async logout(): Promise<void> {
    localStorage.removeItem('mock_google_session')
  }

  async getSession(): Promise<User | null> {
    try {
      const data = localStorage.getItem('mock_google_session')
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }
}

class EmailAuthProvider implements AuthProviderInterface {
  async login(): Promise<User> {
    const userData: User = {
      id: Math.random().toString(36),
      email: 'email@example.com',
      name: 'Email User',
      avatar: 'https://ui-avatars.com/api/?name=Email+User',
      isOnboarded: false,
      authProvider: 'email'
    }

    localStorage.setItem('mock_email_session', JSON.stringify(userData))
    return userData
  }

  async logout(): Promise<void> {
    localStorage.removeItem('mock_email_session')
  }

  async getSession(): Promise<User | null> {
    try {
      const data = localStorage.getItem('mock_email_session')
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }
}

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

class OIDCProvider implements AuthProviderInterface {
  private getConfig() {
    return authConfig.oidc
  }

  async login(): Promise<User> {
    try {
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
      throw new Error('Redirecting...')
    } catch (err) {
      console.error('Login error:', err)
      toast.error('Failed to start login')
      throw err
    }
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
        } catch {}
      }

      const logoutUrl =
        `${endpoints.endSession}?` +
        `client_id=${config.clientId}&` +
        `post_logout_redirect_uri=${redirectUri}` +
        idTokenHint

      sessionStorage.setItem('oidc_logout_pending', 'true')

      window.location.href = logoutUrl
    } catch (err) {
      console.error('Logout error:', err)
      toast.error('Logout failed')
    }
  }

  async getSession(): Promise<User | null> {
    try {
      const data = localStorage.getItem('oidc_session')
      return data ? JSON.parse(data) : null
    } catch {
      return null
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

/* ---------------- PROVIDERS ---------------- */

const providers = {
  google: new GoogleAuthProvider(),
  email: new EmailAuthProvider(),
  oidc: new OIDCProvider()
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

  /* -------- Restore Session -------- */

  React.useEffect(() => {
    try {
      const session = localStorage.getItem('oidc_session')
      if (session) setUser(JSON.parse(session))
    } catch {}
  }, [])

  /* -------- Handle Logout Return -------- */

  React.useEffect(() => {
    if (sessionStorage.getItem('oidc_logout_pending') === 'true') {
      localStorage.clear()
      sessionStorage.clear()

      storeLogout()
      router.replace('/auth/login')
    }
  }, [])

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
        isOnboarded: false,
        authProvider: 'oidc'
      }

      localStorage.setItem('oidc_session', JSON.stringify(userData))
      localStorage.setItem('oidc_tokens', JSON.stringify(tokens))

      window.history.replaceState({}, '', '/')

      setUser(userData)
      router.replace('/profile')
    } catch (err) {
      console.error('Callback error:', err)
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

  const login = async (provider: keyof typeof providers) => {
    setLoading(true)
    try {
      await providers[provider].login()
    } finally {
      setLoading(false)
    }
  }

  /* -------- Logout -------- */

  const logout = async () => {
    setLoading(true)

    try {
      if (user?.authProvider === 'oidc') {
        await providers.oidc.logout()
        return
      }

      localStorage.clear()
      sessionStorage.clear()
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
    logout,
    checkSession,
    authEnabled: authConfig.enabled,
    availableProviders: Object.keys(providers) as (keyof typeof providers)[]
  }
}
