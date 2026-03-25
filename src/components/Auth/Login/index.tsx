import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@hooks/useAuth'
import { toast } from 'react-toastify'
import LeftColumn from './LeftColumn'
import RightColumn from './RightColumn'
import styles from './index.module.css'

interface LoginProps {
  content: {
    title: string
    description: string
    features: Array<{ icon: string; text: string }>
  }
}

export default function Login({ content }: LoginProps) {
  const { isAuthenticated, authEnabled } = useAuth()
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
      router.replace('/auth/login', undefined, { shallow: true })
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

  const handleLoginSuccess = () => {
    const redirectTo = (callbackUrl as string) || '/profile'
    router.push(redirectTo)
  }

  if (!authEnabled) {
    return null
  }

  return (
    <div className={styles.container}>
      <LeftColumn content={content} />
      <RightColumn onLoginSuccess={handleLoginSuccess} />
    </div>
  )
}
