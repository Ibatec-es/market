import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@hooks/useAuth'
import { toast } from 'react-toastify'
import AuthLayout from '../AuthLayout'
import type { AuthPanelContent, AuthTab } from '../constants'

interface LoginProps {
  content: AuthPanelContent
  initialTab?: AuthTab
}

export default function Login({ content, initialTab = 'login' }: LoginProps) {
  const { isAuthenticated, authEnabled } = useAuth()
  const router = useRouter()
  const { callbackUrl, error } = router.query
  const redirectToCallback = () => {
    const redirectTo = (callbackUrl as string) || '/profile'
    router.push(redirectTo)
  }

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
    if (isAuthenticated) {
      const redirectTo = (callbackUrl as string) || '/profile'
      router.push(redirectTo)
    }
  }, [isAuthenticated, router, callbackUrl])

  if (!authEnabled) {
    return null
  }

  return (
    <AuthLayout
      content={content}
      initialTab={initialTab}
      onLoginSuccess={redirectToCallback}
      onSignupSuccess={redirectToCallback}
    />
  )
}
