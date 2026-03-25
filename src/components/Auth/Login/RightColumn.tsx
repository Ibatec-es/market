import { useState } from 'react'
import { useAuth } from '@hooks/useAuth'
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

  const handleSocialLogin = async (
    provider: 'google' | 'twitter' | 'apple'
  ) => {
    setSelectedProvider(provider)
    try {
      await login(provider)
      onLoginSuccess?.()
    } catch (error) {
      setSelectedProvider(null)
    }
  }

  const handleKeycloakLogin = async () => {
    setSelectedProvider('keycloak')
    try {
      await login('keycloak')
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
            <button
              onClick={handleKeycloakLogin}
              disabled={isLoading}
              className={`${styles.socialButton} ${
                isLoading && selectedProvider === 'keycloak'
                  ? styles.loading
                  : ''
              }`}
            >
              <svg className={styles.icon} viewBox="0 0 24 24" fill="#0a4b70">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
              <span>
                {isLoading && selectedProvider === 'keycloak'
                  ? 'Redirecting to login...'
                  : 'Continue with Company SSO'}
              </span>
            </button>

            <div className={styles.divider}>
              <span className={styles.dividerLine}></span>
              <span className={styles.dividerText}>or continue with</span>
              <span className={styles.dividerLine}></span>
            </div>

            <button
              onClick={() => handleSocialLogin('google')}
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

            <button
              onClick={() => handleSocialLogin('twitter')}
              disabled={isLoading}
              className={`${styles.socialButton} ${
                isLoading && selectedProvider === 'twitter'
                  ? styles.loading
                  : ''
              }`}
            >
              <svg className={styles.icon} viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>
                {isLoading && selectedProvider === 'twitter'
                  ? 'Signing in...'
                  : 'Continue with Twitter'}
              </span>
            </button>

            <button
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading}
              className={`${styles.socialButton} ${
                isLoading && selectedProvider === 'apple' ? styles.loading : ''
              }`}
            >
              <svg className={styles.icon} viewBox="0 0 24 24" fill="black">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.47 3.08.8.97-.44 2.03-.84 3.37-.74 1.4.09 2.61.53 3.48 1.29-1.43 1.04-2.14 2.42-1.98 4.15.16 1.72 1.15 3.02 2.53 3.84-.55 1.29-1.37 2.5-2.48 3.63zM14.07 4.4c.72-.9 1.13-2.12.98-3.4-.98.07-2.13.59-2.85 1.48-.66.81-1.07 1.98-.93 3.18 1.04.04 2.14-.52 2.8-1.26z" />
              </svg>
              <span>
                {isLoading && selectedProvider === 'apple'
                  ? 'Signing in...'
                  : 'Continue with Apple'}
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
