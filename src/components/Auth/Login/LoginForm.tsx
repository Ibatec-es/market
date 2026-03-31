import { useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { authConfig } from '../../../config/auth.config'
import { authLoginCopy } from '../constants'
import { SsoIcon } from '../SsoIcons'
import styles from './LoginForm.module.css'

export default function LoginForm() {
  const { beginOidcFlow, isLoading } = useAuth()
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

  const handleOIDCLogin = async () => {
    setSelectedProvider('oidc')
    try {
      await beginOidcFlow('login')
    } catch {
      setSelectedProvider(null)
    }
  }

  const showOIDC = authConfig.oidc.issuer && authConfig.oidc.clientId

  return (
    <div>
      <div className={styles.formHeader}>
        <h2 className={styles.title}>{authLoginCopy.title}</h2>
        <p className={styles.subtitle}>{authLoginCopy.subtitle}</p>
      </div>

      <div className={styles.socialButtons}>
        {showOIDC && (
          <button
            type="button"
            onClick={handleOIDCLogin}
            disabled={isLoading}
            className={`${styles.socialButton} ${
              isLoading && selectedProvider === 'oidc' ? styles.loading : ''
            }`}
          >
            <span className={styles.buttonContent}>
              <SsoIcon variant="building_key" className={styles.icon} />
              <span>
                {isLoading && selectedProvider === 'oidc'
                  ? authLoginCopy.ssoLoadingLabel
                  : authLoginCopy.ssoLabel}
              </span>
            </span>
          </button>
        )}
      </div>

      <div className={styles.demoNotice}>
        <span className={styles.demoDot}></span>
        <span>{authLoginCopy.demoNotice}</span>
      </div>
    </div>
  )
}
