// components/Auth/Login/RightColumn.tsx
import { useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { authConfig } from '../../../config/auth.config'
import styles from './RightColumn.module.css'
import Link from 'next/link'

interface RightColumnProps {
  onLoginSuccess?: () => void
}

export default function RightColumn({ onLoginSuccess }: RightColumnProps) {
  const { login, isLoading } = useAuth()
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [emailError, setEmailError] = useState('')

  const handleOIDCLogin = async () => {
    setSelectedProvider('oidc')
    try {
      await login('oidc')
      onLoginSuccess?.()
    } catch (error) {
      setSelectedProvider(null)
    }
  }

  const handleGoogleLogin = async () => {
    setSelectedProvider('google')
    try {
      await login('google')
      onLoginSuccess?.()
    } catch (error) {
      setSelectedProvider(null)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setEmailError('Please fill in all fields')
      return
    }
    setEmailError('')
    setSelectedProvider('email')
    try {
      await login('email')
      onLoginSuccess?.()
    } catch (error) {
      setSelectedProvider(null)
    }
  }

  // Check if OIDC is configured
  const showOIDC = authConfig.oidc.issuer && authConfig.oidc.clientId

  return (
    <div className={styles.rightColumn}>
      <div className={styles.card}>
        <div className={styles.formHeader}>
          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>
            Sign in to your organization`s data marketplace
          </p>
        </div>

        {!showEmailForm ? (
          <div className={styles.socialButtons}>
            {/* OIDC Button */}
            {showOIDC && (
              <button
                onClick={handleOIDCLogin}
                disabled={isLoading}
                className={`${styles.socialButton} ${
                  isLoading && selectedProvider === 'oidc' ? styles.loading : ''
                }`}
              >
                <svg className={styles.icon} viewBox="0 0 24 24" fill="#0a4b70">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                </svg>
                <span>
                  {isLoading && selectedProvider === 'oidc'
                    ? 'Redirecting to login...'
                    : 'Continue with Company SSO'}
                </span>
              </button>
            )}

            {/* Divider - only show if OIDC button is shown */}
            {showOIDC && (
              <div className={styles.divider}>
                <span className={styles.dividerLine}></span>
                <span className={styles.dividerText}>or continue with</span>
                <span className={styles.dividerLine}></span>
              </div>
            )}

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={`${styles.socialButton} ${
                isLoading && selectedProvider === 'google' ? styles.loading : ''
              }`}
            >
              <svg className={styles.icon} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>
                {isLoading && selectedProvider === 'google'
                  ? 'Signing in...'
                  : 'Continue with Google'}
              </span>
            </button>

            <div className={styles.divider}>
              <span className={styles.dividerLine}></span>
              <span className={styles.dividerText}>or</span>
              <span className={styles.dividerLine}></span>
            </div>

            <button
              onClick={() => setShowEmailForm(true)}
              className={styles.emailButton}
            >
              <svg
                className={styles.icon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Sign in with Email</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className={styles.emailForm}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${styles.input} ${
                  emailError ? styles.inputError : ''
                }`}
                placeholder="you@company.com"
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <div className={styles.checkboxWrapper}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>Remember me</span>
              </label>
              <a href="/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </a>
            </div>

            {emailError && (
              <div className={styles.errorMessage}>{emailError}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading && selectedProvider === 'email'
                ? 'Signing in...'
                : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => setShowEmailForm(false)}
              className={styles.backButton}
            >
              ← Back to all sign in options
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <p>
            Don`t have an account?{' '}
            <Link href="/auth/signup" className={styles.signupLink}>
              Create one
            </Link>
          </p>
        </div>

        <div className={styles.demoNotice}>
          <span className={styles.demoDot}></span>
          <span>Demo Mode: No real authentication required</span>
        </div>
      </div>
    </div>
  )
}
