import { useEffect } from 'react'
import { useAuthStore } from '@hooks/stores/authStore'
import { useAuth } from '@hooks/useAuth'
import { useRouter } from 'next/router'

export default function LogoutCallback() {
  const router = useRouter()
  const storeLogout = useAuthStore((s) => s.logout)
  const { logout } = useAuth()

  useEffect(() => {
    const flow = sessionStorage.getItem('logout_flow')

    const run = async () => {
      // Clear all VM3 related data first
      localStorage.removeItem('oidc_session')
      localStorage.removeItem('oidc_tokens')
      localStorage.removeItem('auth_meta')
      localStorage.removeItem('oidc_auth_meta')

      storeLogout()

      if (flow === 'vm3') {
        // Remove the flow marker BEFORE calling logout
        sessionStorage.removeItem('logout_flow')

        // Call the normal logout flow which should now not detect VM3
        await logout()
      } else {
        // For VM2 or other flows, just redirect
        router.replace('/auth/login')
      }
    }

    run()
  }, [router, storeLogout, logout])

  return <div>Signing you out...</div>
}
