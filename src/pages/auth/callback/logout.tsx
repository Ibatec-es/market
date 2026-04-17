import { useEffect } from 'react'
import { useAuth } from '@hooks/useAuth'

export default function LogoutCallback() {
  const { logout } = useAuth()

  useEffect(() => {
    logout()
  }, [])

  return <div>Signing you out...</div>
}
