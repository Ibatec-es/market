import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@hooks/useAuth'
import LeftColumn from './LeftColumn'
import RightColumn from './RightColumn'
import styles from './index.module.css'

interface SignupProps {
  content: {
    title: string
    description: string
    benefits: Array<{ icon: string; title: string; description: string }>
  }
}

export default function Signup({ content }: SignupProps) {
  const { isAuthenticated, authEnabled } = useAuth()
  const router = useRouter()
  const { callbackUrl } = router.query

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

  const handleSignupSuccess = () => {
    const redirectTo = (callbackUrl as string) || '/profile'
    router.push(redirectTo)
  }

  if (!authEnabled) {
    return null
  }

  return (
    <div className={styles.container}>
      <LeftColumn content={content} />
      <RightColumn onSignupSuccess={handleSignupSuccess} />
    </div>
  )
}
