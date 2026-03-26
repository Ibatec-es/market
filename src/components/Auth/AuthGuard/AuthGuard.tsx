import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@hooks/useAuth'

interface AuthGuardProps {
  children: ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, authEnabled, checkSession } = useAuth()
  const router = useRouter()

  const isPublicRoute = (): boolean => {
    const path = router.asPath.split('?')[0]

    const exactPublicPaths = [
      '/',
      '/auth/login',
      '/auth/signup',
      '/auth/callback',
      '/about',
      '/terms',
      '/privacy',
      '/imprint',
      '/cookie-settings'
    ]

    if (exactPublicPaths.includes(path)) {
      return true
    }

    if (path.startsWith('/privacy/')) {
      return true
    }

    if (path.startsWith('/auth/')) {
      return true
    }

    return false
  }

  useEffect(() => {
    if (authEnabled && router.asPath.includes('/auth/callback')) {
      checkSession()
    }
  }, [authEnabled, router.asPath, checkSession])

  useEffect(() => {
    const isPublic = isPublicRoute()
    if (authEnabled && !isLoading && !isAuthenticated && !isPublic) {
      router.push(
        `/auth/login?callbackUrl=${encodeURIComponent(router.asPath)}`
      )
    }
  }, [authEnabled, isAuthenticated, isLoading, router.asPath, router])

  if (!authEnabled) {
    return <>{children}</>
  }

  if (isLoading && !isPublicRoute()) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#0a4b70',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}
        />
      </div>
    )
  }

  return <>{children}</>
}
