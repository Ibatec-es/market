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
      localStorage.removeItem('oidc_session')
      localStorage.removeItem('oidc_tokens')
      localStorage.removeItem('auth_meta')

      storeLogout()

      if (flow === 'vm3') {
        sessionStorage.removeItem('logout_flow')
        await logout()
      }
      router.replace('/auth/login')
    }

    run()
  }, [])

  return <div>Signing you out...</div>
}
