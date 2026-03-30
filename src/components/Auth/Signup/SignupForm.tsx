import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@context/UserPreferences'
import { authConfig } from '../../../config/auth.config'
import { authSignupCopy } from '../constants'
import { SsoIcon } from '../SsoIcons'
import styles from './SignupForm.module.css'

interface SignupFormProps {
  onSignupSuccess?: () => void
}

export default function SignupForm({ onSignupSuccess }: SignupFormProps) {
  const { login, isLoading } = useAuth()
  const { privacyPolicySlug } = useUserPreferences()
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

  const handleOIDCSignup = async () => {
    setSelectedProvider('oidc')
    try {
      await login('oidc')
      onSignupSuccess?.()
    } catch (error) {
      setSelectedProvider(null)
    }
  }

  const showOIDC = authConfig.oidc.issuer && authConfig.oidc.clientId

  return (
    <div>
      <div className={styles.formHeader}>
        <h2 className={styles.title}>{authSignupCopy.title}</h2>
        <p className={styles.subtitle}>{authSignupCopy.subtitle}</p>
      </div>

      <div className={styles.socialButtons}>
        {showOIDC && (
          <button
            onClick={handleOIDCSignup}
            disabled={isLoading}
            className={`${styles.socialButton} ${
              isLoading && selectedProvider === 'oidc' ? styles.loading : ''
            }`}
          >
            <span className={styles.buttonContent}>
              <SsoIcon variant="user_plus" className={styles.icon} />
              <span>
                {isLoading && selectedProvider === 'oidc'
                  ? authSignupCopy.ssoLoadingLabel
                  : authSignupCopy.ssoLabel}
              </span>
            </span>
          </button>
        )}
      </div>

      <div className={styles.terms}>
        {authSignupCopy.termsIntro}{' '}
        <Link href={`${privacyPolicySlug}#terms-and-conditions`}>
          {authSignupCopy.termsLabel}
        </Link>{' '}
        and{' '}
        <Link href={`${privacyPolicySlug}#privacy-policy`}>
          {authSignupCopy.privacyLabel}
        </Link>
      </div>
    </div>
  )
}
