import { useAuthStore, User } from './stores/authStore'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { authConfig } from '../config/auth.config'

interface AuthProviderInterface {
  login: () => Promise<User>
  logout: () => Promise<void>
  getSession: () => Promise<User | null>
}

class GoogleAuthProvider implements AuthProviderInterface {
  async login(): Promise<User> {
    return {
      id: Math.random().toString(36),
      email: 'user@example.com',
      name: 'John Doe',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe',
      isOnboarded: false,
      authProvider: 'google'
    }
  }

  async logout(): Promise<void> {}
  async getSession(): Promise<User | null> {
    return null
  }
}

class TwitterAuthProvider implements AuthProviderInterface {
  async login(): Promise<User> {
    throw new Error('Twitter auth coming soon')
  }

  async logout(): Promise<void> {}
  async getSession(): Promise<User | null> {
    return null
  }
}

class AppleAuthProvider implements AuthProviderInterface {
  async login(): Promise<User> {
    throw new Error('Apple auth coming soon')
  }

  async logout(): Promise<void> {}
  async getSession(): Promise<User | null> {
    return null
  }
}

class EmailAuthProvider implements AuthProviderInterface {
  async login(): Promise<User> {
    return {
      id: Math.random().toString(36),
      email: 'email@example.com',
      name: 'Email User',
      avatar: 'https://ui-avatars.com/api/?name=Email+User',
      isOnboarded: false,
      authProvider: 'email'
    }
  }

  async logout(): Promise<void> {}
  async getSession(): Promise<User | null> {
    return null
  }
}

class KeycloakAuthProvider implements AuthProviderInterface {
  async login(): Promise<User> {
    const keycloakConfig = authConfig.keycloak
    const redirectUri = encodeURIComponent(keycloakConfig.redirectUri)
    const { clientId } = keycloakConfig

    const codeVerifier = this.generateCodeVerifier()
    const codeChallenge = await this.generateCodeChallenge(codeVerifier)

    sessionStorage.setItem('pkce_code_verifier', codeVerifier)

    const authUrl =
      `${keycloakConfig.issuer}/protocol/openid-connect/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=openid profile email&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`

    window.location.href = authUrl
    throw new Error('Redirecting to Keycloak...')
  }

  async logout(): Promise<void> {
    const keycloakConfig = authConfig.keycloak
    const redirectUri = encodeURIComponent(window.location.origin)
    const logoutUrl =
      `${keycloakConfig.issuer}/protocol/openid-connect/logout?` +
      `redirect_uri=${redirectUri}`
    window.location.href = logoutUrl
  }

  async getSession(): Promise<User | null> {
    const sessionData = localStorage.getItem('keycloak_session')
    if (sessionData) {
      try {
        return JSON.parse(sessionData)
      } catch {
        return null
      }
    }
    return null
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
  twitter: new TwitterAuthProvider(),
  apple: new AppleAuthProvider(),
  email: new EmailAuthProvider(),
  keycloak: new KeycloakAuthProvider()
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

  const handleKeycloakCallback = async (code: string) => {
    try {
      const codeVerifier = sessionStorage.getItem('pkce_code_verifier')
      const keycloakConfig = authConfig.keycloak

      const tokenResponse = await fetch(
        `${keycloakConfig.issuer}/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: keycloakConfig.clientId,
            code,
            redirect_uri: keycloakConfig.redirectUri,
            code_verifier: codeVerifier || ''
          })
        }
      )

      const tokens = await tokenResponse.json()

      const idToken = tokens.id_token
      const payload = JSON.parse(atob(idToken.split('.')[1]))

      const userData: User = {
        id: payload.sub,
        email: payload.email || `${payload.preferred_username}@keycloak.local`,
        name: payload.name || payload.preferred_username || 'Keycloak User',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          payload.name || 'User'
        )}&background=0a4b70&color=fff`,
        isOnboarded: false,
        authProvider: 'keycloak',
        walletAddress: payload.eth_address
      }

      localStorage.setItem('keycloak_session', JSON.stringify(userData))
      localStorage.setItem('keycloak_tokens', JSON.stringify(tokens))

      window.history.replaceState({}, '', window.location.pathname)
      useAuthStore.getState().setUser(userData)

      toast.success(`Welcome ${userData.name}!`)
      router.push('/profile')
    } catch (error) {
      console.error('Keycloak callback error:', error)
      toast.error('Authentication failed')
      router.push('/auth/login')
    }
  }

  const checkSession = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    if (code) {
      await handleKeycloakCallback(code)
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
      if (provider !== 'keycloak') {
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
      if (user?.authProvider) {
        const authProvider =
          providers[user.authProvider as keyof typeof providers]
        await authProvider.logout()
      }
      localStorage.removeItem('keycloak_session')
      localStorage.removeItem('keycloak_tokens')
      storeLogout()
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to sign out')
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
    authEnabled: authConfig.enabled
  }
}
