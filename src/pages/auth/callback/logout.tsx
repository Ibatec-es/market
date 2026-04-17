import { useEffect } from 'react'
import { useAuthStore } from '@hooks/stores/authStore'
import { useRouter } from 'next/router'

export default function LogoutCallback() {
  const router = useRouter()
  const storeLogout = useAuthStore((s) => s.logout)

  useEffect(() => {
    const meta = JSON.parse(localStorage.getItem('auth_meta') || '{}')
    const issuer = meta?.issuer
    const upstream = meta?.upstream_idp
    localStorage.removeItem('oidc_session')
    localStorage.removeItem('oidc_tokens')
    localStorage.removeItem('auth_meta')

    storeLogout()

    router.replace('/auth/login')
  }, [])

  return <div>Signing you out...</div>
}
