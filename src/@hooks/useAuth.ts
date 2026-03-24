import { useAuthStore, User } from './stores/authStore'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

// Mock auth providers
interface AuthProvider {
  login: () => Promise<User>
  logout: () => Promise<void>
  getSession: () => Promise<User | null>
}

class GoogleAuthProvider implements AuthProvider {
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

class TwitterAuthProvider implements AuthProvider {
  async login(): Promise<User> {
    throw new Error('Twitter auth coming soon')
  }

  async logout(): Promise<void> {}
  async getSession(): Promise<User | null> {
    return null
  }
}

class AppleAuthProvider implements AuthProvider {
  async login(): Promise<User> {
    throw new Error('Apple auth coming soon')
  }

  async logout(): Promise<void> {}
  async getSession(): Promise<User | null> {
    return null
  }
}

// Add Email provider
class EmailAuthProvider implements AuthProvider {
  async login(): Promise<User> {
    // TODO: Implement email/password login
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

// Provider factory - add email provider
const providers = {
  google: new GoogleAuthProvider(),
  twitter: new TwitterAuthProvider(),
  apple: new AppleAuthProvider(),
  email: new EmailAuthProvider() // Add this
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

  // Update login type to include 'email'
  const login = async (provider: keyof typeof providers) => {
    setLoading(true)
    try {
      const authProvider = providers[provider]
      const userData = await authProvider.login()
      setUser(userData)
      toast.success(`Welcome ${userData.name}!`)

      if (!userData.isOnboarded) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Failed to sign in. Please try again.')
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

  const checkSession = async () => {}

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkSession
  }
}
