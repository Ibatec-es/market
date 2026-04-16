import { useAuthStore, User } from './stores/authStore'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { authConfig } from '../config/auth.config'
import React from 'react'
import {
  clearPendingAuthMode,
  clearPendingCallbackUrl,
  setPendingAuthMode,
  getPendingCallbackUrl,
  setPendingCallbackUrl,
  type PendingAuthMode
} from '@utils/authFlow'
import {
  OIDC_LOGOUT_PENDING_KEY,
  OIDC_LOGOUT_RETURN_FALLBACK_MS,
  OIDC_LOGOUT_STARTED_AT_KEY,
  OIDC_LOGOUT_STATE_KEY
} from '@components/Auth/constants'

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

  async signup(): Promise<void> {
    const config = this.getConfig()
    const endpoints = getEndpoints(config.issuer)

    const codeVerifier = this.generateCodeVerifier()
    const codeChallenge = await this.generateCodeChallenge(codeVerifier)

    sessionStorage.setItem('oidc_pkce_code_verifier', codeVerifier)

    const authorizeUrl =
      `${endpoints.authorize}?` +
      `client_id=${config.clientId}&` +
      `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
      `response_type=code&` +
      `scope=${config.scope}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`

    const flowSlug = 'self-service-registration'
    const authentikBase = config.issuer.replace(/\/application\/o\/.*$/, '')

    const signupUrl =
      `${authentikBase}/if/flow/${flowSlug}/?` +
      `next=${encodeURIComponent(authorizeUrl)}`

    window.location.href = signupUrl
  }

  async login(): Promise<void> {
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
      sessionStorage.setItem(OIDC_LOGOUT_STATE_KEY, state)

      const logoutUrl =
        `${endpoints.endSession}?` +
        `client_id=${config.clientId}&` +
        `post_logout_redirect_uri=${redirectUri}&` +
        `state=${state}` +
        idTokenHint

      sessionStorage.setItem(OIDC_LOGOUT_PENDING_KEY, 'true')
      sessionStorage.setItem(OIDC_LOGOUT_STARTED_AT_KEY, Date.now().toString())
      window.location.href = logoutUrl
    } catch (err) {
      console.error('Logout error:', err)
      toast.error('Logout failed')
      throw err
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
  sessionStorage.removeItem(OIDC_LOGOUT_STATE_KEY)
  sessionStorage.removeItem(OIDC_LOGOUT_PENDING_KEY)
  sessionStorage.removeItem(OIDC_LOGOUT_STARTED_AT_KEY)
  clearPendingAuthMode()
  clearPendingCallbackUrl()
}

const isOidcLogoutPending = () =>
  typeof window !== 'undefined' &&
  sessionStorage.getItem(OIDC_LOGOUT_PENDING_KEY) === 'true'

const hasOidcLogoutReturnState = (returnState: string | null) =>
  typeof window !== 'undefined' &&
  Boolean(
    returnState && sessionStorage.getItem(OIDC_LOGOUT_STATE_KEY) === returnState
  )

/* ---------------- HOOK ---------------- */

export const useAuth = () => {
  const {
    user,
    isLoading,
    isLogoutPending,
    setUser,
    setLoading,
    setLogoutPending,
    logout: storeLogout
  } = useAuthStore()

  const authEnabled = authConfig.enabled

  const router = useRouter()
  const logoutReturnState =
    typeof router.query.state === 'string' ? router.query.state : null
  /* -------- Handle Logout Return -------- */
  React.useEffect(() => {
    if (!router.isReady) return
    if (isOidcLogoutPending()) {
      const completeOidcLogoutReturn = () => {
        if (!isOidcLogoutPending()) return

        clearOidcStorage()
        setLogoutPending(false)
        storeLogout()

        if (window.location.pathname !== '/auth/login') {
          router.replace('/auth/login')
          return
        }

        if (!logoutReturnState) return

        const nextQuery = { ...router.query }
        delete nextQuery.state

        router.replace(
          {
            pathname: '/auth/login',
            query: nextQuery
          },
          undefined,
          { shallow: true }
        )
      }

      if (
        window.location.pathname !== '/auth/login' ||
        hasOidcLogoutReturnState(logoutReturnState)
      ) {
        completeOidcLogoutReturn()
        return
      }

      const timeoutId = window.setTimeout(
        completeOidcLogoutReturn,
        OIDC_LOGOUT_RETURN_FALLBACK_MS
      )

      return () => window.clearTimeout(timeoutId)
    }
  }, [logoutReturnState, router, setLogoutPending, storeLogout])

  /* -------- Restore Session -------- */

  React.useEffect(() => {
    if (isOidcLogoutPending()) return

    try {
      const session = localStorage.getItem('oidc_session')
      if (session) setUser(JSON.parse(session))
    } catch {}
  }, [setUser])

  /* -------- Callback -------- */

  const handleOIDCCallback = React.useCallback(
    async (code: string) => {
      if (sessionStorage.getItem('oidc_processing')) return

      sessionStorage.setItem('oidc_processing', 'true')

      try {
        const config = authConfig.oidc
        const endpoints = getEndpoints(config.issuer)

        console.log('========== OIDC CALLBACK START ==========')
        console.log('AUTH CONFIG:', config)
        console.log('OIDC ENDPOINTS:', endpoints)
        console.log('AUTH CODE:', code)

        const res = await fetch(endpoints.token, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: config.clientId,
            client_secret: config.clientSecret || '',
            code,
            redirect_uri: config.redirectUri,
            code_verifier:
              sessionStorage.getItem('oidc_pkce_code_verifier') || ''
          })
        })

        console.log('TOKEN RESPONSE STATUS:', res.status)
        console.log('TOKEN RESPONSE OK:', res.ok)

        if (!res.ok) {
          const errorText = await res.text()
          console.error('TOKEN ERROR RESPONSE:', errorText)
          throw new Error(errorText)
        }

        const tokens = await res.json()

        console.log('========== TOKEN RESPONSE ==========')
        console.log(tokens)

        console.log('ACCESS TOKEN:', tokens.access_token)
        console.log('ID TOKEN:', tokens.id_token)
        console.log('REFRESH TOKEN:', tokens.refresh_token)
        console.log('EXPIRES IN:', tokens.expires_in)

        const payload = JSON.parse(atob(tokens.id_token.split('.')[1]))

        console.log('========== ID TOKEN PAYLOAD ==========')
        console.log(payload)

        console.log('ISSUER (MAIN OIDC):', payload.iss)
        console.log('SUBJECT:', payload.sub)
        console.log('EMAIL:', payload.email)
        console.log('NAME:', payload.name)
        console.log('AUDIENCE:', payload.aud)
        console.log('CLAIM KEYS:', Object.keys(payload))

        const authMeta = {
          main_oidc: payload.iss,
          upstream_idp:
            payload.upstream_idp ||
            payload.last_idp ||
            payload.idp ||
            payload.source ||
            payload.provider ||
            payload.amr?.[0] ||
            'unknown'
        }

        console.log('========== AUTH META ==========')
        console.log(authMeta)

        localStorage.setItem('oidc_auth_meta', JSON.stringify(authMeta))

        const userData: User = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          avatar: `https://ui-avatars.com/api/?name=${payload.name}`,
          isOnboarded: false,
          authProvider: 'oidc'
        }

        console.log('========== USER DATA ==========')
        console.log(userData)

        localStorage.setItem('oidc_session', JSON.stringify(userData))
        localStorage.setItem('oidc_tokens', JSON.stringify(tokens))

        const callbackUrl = getPendingCallbackUrl()
        clearPendingCallbackUrl()

        setUser(userData)

        console.log('REDIRECTING TO APP...')
        console.log('========== OIDC CALLBACK END ==========')

        router.replace({
          pathname: '/auth/login',
          ...(callbackUrl ? { query: { callbackUrl } } : {})
        })
      } catch (err) {
        console.error('========== CALLBACK ERROR ==========')
        console.error(err)

        clearPendingAuthMode()
        clearPendingCallbackUrl()
        toast.error('Login failed')
        router.replace('/auth/login')
      } finally {
        sessionStorage.removeItem('oidc_processing')
      }
    },
    [router, setUser]
  )

  const checkSession = React.useCallback(async () => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) await handleOIDCCallback(code)
  }, [handleOIDCCallback])

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
    const callbackUrl =
      typeof router.query.callbackUrl === 'string'
        ? router.query.callbackUrl
        : null

    setPendingAuthMode(mode)

    if (callbackUrl) {
      setPendingCallbackUrl(callbackUrl)
    } else {
      clearPendingCallbackUrl()
    }

    await login(mode)
  }

  /* -------- Logout -------- */

  const logout = async () => {
    setLoading(true)

    try {
      if (user?.authProvider === 'oidc') {
        setLogoutPending(true)
        localStorage.removeItem('oidc_session')
        clearPendingAuthMode()
        clearPendingCallbackUrl()
        storeLogout()
        await oidcProvider.logout()
        return
      }

      clearOidcStorage()
      setLogoutPending(false)
      storeLogout()

      router.replace('/auth/login')
    } catch (error) {
      setLogoutPending(false)
      console.error('Logout flow failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    isLoading,
    isLogoutPending,
    isAuthenticated: !!user,
    login,
    beginOidcFlow,
    logout,
    checkSession,
    authEnabled
  }
}
