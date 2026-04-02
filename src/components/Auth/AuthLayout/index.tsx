import { useEffect, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { getPendingAuthMode } from '@utils/authFlow'
import LoginForm from '../Login/LoginForm'
import SignupForm from '../Signup/SignupForm'
import {
  authTabLabels,
  type AuthPanelContent,
  type AuthTab
} from '../constants'
import BrandPanel from './BrandPanel'
import SetupPanel from './SetupPanel'
import styles from './index.module.css'

interface AuthLayoutProps {
  content: AuthPanelContent
  initialTab?: AuthTab
}

export default function AuthLayout({
  content,
  initialTab = 'login'
}: AuthLayoutProps) {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<AuthTab>(() => {
    const pendingMode = getPendingAuthMode()
    return pendingMode ?? initialTab
  })

  useEffect(() => {
    if (isAuthenticated) return

    const pendingMode = getPendingAuthMode()
    setActiveTab(pendingMode ?? initialTab)
  }, [initialTab, isAuthenticated])

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <BrandPanel content={content} />
        <div className={styles.formPanel}>
          {!isAuthenticated && (
            <div className={styles.pillTabs}>
              <button
                type="button"
                className={`${styles.pillTab} ${
                  activeTab === 'login' ? styles.pillTabActive : ''
                }`}
                onClick={() => setActiveTab('login')}
              >
                {authTabLabels.login}
              </button>
              <button
                type="button"
                className={`${styles.pillTab} ${
                  activeTab === 'signup' ? styles.pillTabActive : ''
                }`}
                onClick={() => setActiveTab('signup')}
              >
                {authTabLabels.signup}
              </button>
            </div>
          )}

          <div className={styles.formContent}>
            {isAuthenticated ? (
              <SetupPanel />
            ) : activeTab === 'login' ? (
              <LoginForm />
            ) : (
              <SignupForm />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
