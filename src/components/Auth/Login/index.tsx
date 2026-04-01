import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@hooks/useAuth'
import { useSsiWallet } from '@context/SsiWallet'
import { toast } from 'react-toastify'
import AuthLayout from '../AuthLayout'
import type { AuthPanelContent, AuthTab } from '../constants'
import { useAccount } from 'wagmi'

interface LoginProps {
  content: AuthPanelContent
  initialTab?: AuthTab
}

export default function Login({ content, initialTab = 'login' }: LoginProps) {
  const { isAuthenticated, authEnabled } = useAuth()
  const { isConnected } = useAccount()
  const { sessionToken, isSsiStateHydrated } = useSsiWallet()
  const router = useRouter()
  const { callbackUrl, error } = router.query

  useEffect(() => {
    if (error) {
      switch (error) {
        case 'access_denied':
          toast.error('Access denied. Please try again.')
          break
        case 'auth_failed':
          toast.error('Authentication failed. Please try again.')
          break
        default:
          toast.error('Authentication error. Please try again.')
      }
      const nextQuery = { ...router.query }
      delete nextQuery.error

      router.replace(
        {
          pathname: '/auth/login',
          query: nextQuery
        },
        undefined,
        { shallow: true }
      )
    }
  }, [error, router])

  useEffect(() => {
    if (!authEnabled) {
      router.push('/')
    }
  }, [authEnabled, router])

  useEffect(() => {
    if (!isAuthenticated) return
    if (!isConnected) return
    if (!isSsiStateHydrated) return
    if (!sessionToken) return

    const redirectTo = (callbackUrl as string) || '/profile'
    const timeoutId = window.setTimeout(() => {
      router.replace(redirectTo)
    }, 900)

    return () => window.clearTimeout(timeoutId)
  }, [
    callbackUrl,
    isAuthenticated,
    isConnected,
    isSsiStateHydrated,
    router,
    sessionToken
  ])

  if (!authEnabled) {
    return null
  }

  return <AuthLayout content={content} initialTab={initialTab} />
}
