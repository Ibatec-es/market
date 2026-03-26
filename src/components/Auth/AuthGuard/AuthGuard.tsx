import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@hooks/useAuth'

interface AuthGuardProps {
  children: ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, authEnabled, checkSession } = useAuth()
  const router = useRouter()

  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/auth/callback',
    '/about',
    '/terms',
    '/privacy'
  ]

  const isPublicRoute =
    publicRoutes.includes(router.pathname) ||
    router.pathname.startsWith('/auth/')

  useEffect(() => {
    if (authEnabled && router.pathname === '/auth/callback') {
      checkSession()
    }
  }, [authEnabled, router.pathname, checkSession])

  useEffect(() => {
    if (authEnabled && !isLoading && !isAuthenticated && !isPublicRoute) {
      router.push(
        `/auth/login?callbackUrl=${encodeURIComponent(router.asPath)}`
      )
    }
  }, [authEnabled, isAuthenticated, isLoading, router, isPublicRoute])

  if (!authEnabled) {
    return <>{children}</>
  }

  if (isLoading && !isPublicRoute) {
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
