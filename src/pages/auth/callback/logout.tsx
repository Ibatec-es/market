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
      if (flow === 'vm3') {
        // We just completed VM3 logout, now clear VM3 marker
        sessionStorage.removeItem('logout_flow')

        // Clear VM3 specific data
        localStorage.removeItem('auth_meta')
        localStorage.removeItem('oidc_auth_meta')

        // Now call the normal OIDC logout for VM2
        await logout()
      } else {
        // Normal flow or after VM2 logout
        localStorage.removeItem('oidc_session')
        localStorage.removeItem('oidc_tokens')
        storeLogout()
        router.replace('/auth/login')
      }
    }

    run()
  }, [router, storeLogout, logout])

  return <div>Signing you out...</div>
}
