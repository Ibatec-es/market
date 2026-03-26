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

class GoogleAuthProvider implements AuthProviderInterface {
  async login(): Promise<User> {
    const userData: User = {
      id: Math.random().toString(36),
      email: 'test.user@example.com',
      name: 'Test User',
      avatar:
        'https://ui-avatars.com/api/?name=Test+User&background=0a4b70&color=fff',
      isOnboarded: false,
      authProvider: 'google'
    }

    localStorage.setItem('mock_google_session', JSON.stringify(userData))
    console.log('Mock Google login - session saved')

    return userData
  }

  async logout(): Promise<void> {
    localStorage.removeItem('mock_google_session')
    console.log('Mock Google logout - session cleared')
  }

  async getSession(): Promise<User | null> {
    const sessionData = localStorage.getItem('mock_google_session')
    if (sessionData) {
      try {
        return JSON.parse(sessionData)
      } catch {
        return null
      }
    }
    return null
  }
}

class EmailAuthProvider implements AuthProviderInterface {
  async login(): Promise<User> {
    const userData: User = {
      id: Math.random().toString(36),
      email: 'email@example.com',
      name: 'Email User',
      avatar:
        'https://ui-avatars.com/api/?name=Email+User&background=0a4b70&color=fff',
      isOnboarded: false,
      authProvider: 'email'
    }

    localStorage.setItem('mock_email_session', JSON.stringify(userData))
    console.log('Mock Email login - session saved')

    return userData
  }

  async logout(): Promise<void> {
    localStorage.removeItem('mock_email_session')
    console.log('Mock Email logout - session cleared')
  }

  async getSession(): Promise<User | null> {
    const sessionData = localStorage.getItem('mock_email_session')
    if (sessionData) {
      try {
        return JSON.parse(sessionData)
      } catch {
        return null
      }
    }
    return null
  }
}

const getEndpoints = (issuer: string) => {
  const isAuthentik = issuer.includes('/application/o/')
  const isKeycloak = issuer.includes('/realms/')

  let baseUrl: string
  let logoutBaseUrl: string

  if (isAuthentik) {
    const match = issuer.match(/(.*\/application\/o\/)[^/]+\/?$/)
    baseUrl = match
      ? match[1].replace(/\/$/, '')
      : issuer.replace(/\/[^/]+?\/?$/, '')
    logoutBaseUrl = issuer.replace(/\/$/, '')
  } else {
    baseUrl = issuer.endsWith('/') ? issuer.slice(0, -1) : issuer
    logoutBaseUrl = baseUrl
  }

  return {
    authorize: `${baseUrl}/authorize/`,
    token: `${baseUrl}/token/`,
    userinfo: `${baseUrl}/userinfo/`,
    endSession: `${logoutBaseUrl}/end-session/`,
    isKeycloak,
    isAuthentik
  }
}

class OIDCProvider implements AuthProviderInterface {
  private getConfig() {
    return authConfig.oidc
  }

  async login(): Promise<User> {
    const config = this.getConfig()
    const endpoints = getEndpoints(config.issuer)
    const redirectUri = encodeURIComponent(config.redirectUri)
    const { clientId } = config

    const codeVerifier = this.generateCodeVerifier()
    const codeChallenge = await this.generateCodeChallenge(codeVerifier)

    sessionStorage.setItem('oidc_pkce_code_verifier', codeVerifier)

    const authUrl =
      `${endpoints.authorize}?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${config.scope}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`

    window.location.href = authUrl
    throw new Error('Redirecting to OIDC provider...')
  }

  async logout(): Promise<void> {
    const config = this.getConfig()
    const endpoints = getEndpoints(config.issuer)
    const redirectUri = encodeURIComponent(window.location.origin)
    const tokens = localStorage.getItem('oidc_tokens')
    let idTokenHint = ''

    if (tokens) {
      try {
        const tokenData = JSON.parse(tokens)
        if (tokenData.id_token) {
          idTokenHint = `&id_token_hint=${encodeURIComponent(
            tokenData.id_token
          )}`
        }
      } catch (e) {
        console.error('Error parsing tokens:', e)
      }
    }

    const logoutUrl =
      `${endpoints.endSession}?` +
      `client_id=${config.clientId}&` +
      `post_logout_redirect_uri=${redirectUri}${idTokenHint}`

    this.clearSession()
    window.location.href = logoutUrl
  }

  async getSession(): Promise<User | null> {
    const sessionData = localStorage.getItem('oidc_session')
    if (sessionData) {
      try {
        return JSON.parse(sessionData)
      } catch {
        return null
      }
    }
    return null
  }

  private clearSession(): void {
    localStorage.removeItem('oidc_session')
    localStorage.removeItem('oidc_tokens')
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
      ''
    )
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }
}

const providers = {
  google: new GoogleAuthProvider(),
  email: new EmailAuthProvider(),
  oidc: new OIDCProvider()
}

export const useAuth = () => {
  const {
    user,
    isLoading,
    setUser,
    setLoading,
    logout: storeLogout
  } = useAuthStore()
  const router = useRouter()

  const restoreSession = async () => {
    const mockGoogleSession = localStorage.getItem('mock_google_session')
    if (mockGoogleSession) {
      try {
        const userData = JSON.parse(mockGoogleSession)
        setUser(userData)
        console.log('Restored Google session:', userData.email)
        return
      } catch (e) {
        console.error('Failed to restore Google session', e)
      }
    }

    const mockEmailSession = localStorage.getItem('mock_email_session')
    if (mockEmailSession) {
      try {
        const userData = JSON.parse(mockEmailSession)
        setUser(userData)
        console.log('Restored Email session:', userData.email)
        return
      } catch (e) {
        console.error('Failed to restore Email session', e)
      }
    }

    const oidcSession = localStorage.getItem('oidc_session')
    if (oidcSession) {
      try {
        const userData = JSON.parse(oidcSession)
        setUser(userData)
        console.log('Restored OIDC session:', userData.email)
      } catch (e) {
        console.error('Failed to restore OIDC session', e)
      }
    }
  }

  React.useEffect(() => {
    restoreSession()
  }, [])

  const handleOIDCCallback = async (code: string) => {
    try {
      const codeVerifier = sessionStorage.getItem('oidc_pkce_code_verifier')
      const config = authConfig.oidc
      const endpoints = getEndpoints(config.issuer)
      const tokenEndpoint = endpoints.token
      const tokenResponse = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: config.clientId,
          client_secret: config.clientSecret || '',
          code,
          redirect_uri: config.redirectUri,
          code_verifier: codeVerifier || ''
        })
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text()
        console.error('Token exchange failed:', errorData)
        throw new Error(`Token exchange failed: ${tokenResponse.status}`)
      }

      const tokens = await tokenResponse.json()

      const idToken = tokens.id_token
      const payload = JSON.parse(atob(idToken.split('.')[1]))

      const userData: User = {
        id: payload.sub,
        email:
          payload.email ||
          payload.preferred_username ||
          `${payload.sub}@oidc.local`,
        name: payload.name || payload.preferred_username || 'OIDC User',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          payload.name || 'User'
        )}&background=0a4b70&color=fff`,
        isOnboarded: false,
        authProvider: 'oidc',
        walletAddress: payload.eth_address
      }

      localStorage.setItem('oidc_session', JSON.stringify(userData))
      localStorage.setItem('oidc_tokens', JSON.stringify(tokens))

      window.history.replaceState({}, '', window.location.pathname)
      useAuthStore.getState().setUser(userData)

      toast.success(`Welcome ${userData.name}!`)
      router.push('/profile')
    } catch (error) {
      console.error('OIDC callback error:', error)
      toast.error('Authentication failed')
      router.push('/auth/login')
    }
  }

  const checkSession = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    if (code) {
      await handleOIDCCallback(code)
    }
  }

  const login = async (provider: keyof typeof providers) => {
    setLoading(true)
    try {
      const authProvider = providers[provider]
      const userData = await authProvider.login()
      setUser(userData)
      toast.success(`Welcome ${userData.name}!`)

      if (!userData.isOnboarded) {
        router.push('/profile')
      } else {
        router.push('/profile')
      }
    } catch (error) {
      console.error('Login error:', error)
      if (provider !== 'oidc') {
        toast.error('Failed to sign in. Please try again.')
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      const mockProviders = ['google', 'email']
      const isMockProvider =
        user?.authProvider && mockProviders.includes(user.authProvider)

      if (isMockProvider && user?.authProvider) {
        const authProvider = providers[user.authProvider as 'google' | 'email']
        await authProvider.logout()
      }

      if (user?.authProvider === 'oidc') {
        const authProvider = providers.oidc
        await authProvider.logout()
      }

      localStorage.removeItem('oidc_session')
      localStorage.removeItem('oidc_tokens')
      localStorage.removeItem('mock_google_session')
      localStorage.removeItem('mock_email_session')
      sessionStorage.removeItem('oidc_pkce_code_verifier')
      storeLogout()
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.removeItem('oidc_session')
      localStorage.removeItem('oidc_tokens')
      localStorage.removeItem('mock_google_session')
      localStorage.removeItem('mock_email_session')
      storeLogout()
      toast.error('Signed out locally')
      router.push('/')
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
