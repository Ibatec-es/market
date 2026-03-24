import { useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { useAuth } from '@hooks/useAuth'
import styles from './index.module.css'

interface SignupProps {
  content: {
    title: string
    description: string
    benefits: Array<{ icon: string; title: string; description: string }>
  }
}

export default function Signup({ content }: SignupProps) {
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSocialSignup = async (
    provider: 'google' | 'twitter' | 'apple'
  ) => {
    setSelectedProvider(provider)
    try {
      await login(provider)
    } catch (error) {
      setSelectedProvider(null)
    }
  }

  const validateEmailForm = () => {
    const newErrors: Record<string, string> = {}
    if (!name) newErrors.name = 'Full name is required'
    if (!email) newErrors.email = 'Email is required'
    if (!email.includes('@')) newErrors.email = 'Invalid email format'
    if (!password) newErrors.password = 'Password is required'
    if (password.length < 8)
      newErrors.password = 'Password must be at least 8 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmailForm()) return
    setSelectedProvider('email')
    try {
      await login('email')
    } catch (error) {
      setSelectedProvider(null)
    }
  }

  return (
    <div className={styles.authContainer}>
      {/* Left Column - Benefits */}
      <div className={styles.authHero}>
        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>
            {content.title || 'Start monetizing your data assets today'}
          </h2>

          <div className={styles.benefitsList}>
            {(
              content.benefits || [
                {
                  icon: '💰',
                  title: 'Monetize your data',
                  description: 'Turn your data assets into revenue streams'
                },
                {
                  icon: '🔐',
                  title: 'Enterprise security',
                  description: 'Institutional-grade protection for your assets'
                },
                {
                  icon: '⚡',
                  title: 'Gasless transactions',
                  description: 'No need to hold crypto for transactions'
                },
                {
                  icon: '👥',
                  title: 'Team collaboration',
                  description: 'Multi-signature wallets for organizations'
                }
              ]
            ).map((benefit, index) => (
              <div key={index} className={styles.benefitItem}>
                <div className={styles.benefitIcon}>{benefit.icon}</div>
                <div className={styles.benefitContent}>
                  <div className={styles.benefitTitle}>{benefit.title}</div>
                  <div className={styles.benefitDescription}>
                    {benefit.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Signup Form */}
      <div className={styles.authForm}>
        <div className={styles.formWrapper}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <div className={styles.mobileLogo}>
                <Image
                  src="/images/ocean-logo.svg"
                  alt="Ocean Protocol"
                  width={120}
                  height={30}
                />
              </div>
              <h2 className={styles.formTitle}>Create your account</h2>
              <p className={styles.formSubtitle}>
                Join the future of data monetization
              </p>
            </div>

            {!showEmailForm ? (
              <div className={styles.socialButtons}>
                <button
                  onClick={() => handleSocialSignup('google')}
                  disabled={isLoading}
                  className={`${styles.socialButton} ${
                    isLoading && selectedProvider === 'google'
                      ? styles.socialButtonLoading
                      : ''
                  }`}
                >
                  <svg className={styles.socialIcon} viewBox="0 0 24 24">
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
                      ? 'Creating account...'
                      : 'Continue with Google'}
                  </span>
                </button>

                <button
                  onClick={() => handleSocialSignup('twitter')}
                  disabled={isLoading}
                  className={`${styles.socialButton} ${
                    isLoading && selectedProvider === 'twitter'
                      ? styles.socialButtonLoading
                      : ''
                  }`}
                >
                  <svg
                    className={styles.socialIcon}
                    viewBox="0 0 24 24"
                    fill="#1DA1F2"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>
                    {isLoading && selectedProvider === 'twitter'
                      ? 'Creating account...'
                      : 'Continue with Twitter'}
                  </span>
                </button>

                <button
                  onClick={() => handleSocialSignup('apple')}
                  disabled={isLoading}
                  className={`${styles.socialButton} ${
                    isLoading && selectedProvider === 'apple'
                      ? styles.socialButtonLoading
                      : ''
                  }`}
                >
                  <svg
                    className={styles.socialIcon}
                    viewBox="0 0 24 24"
                    fill="black"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.47 3.08.8.97-.44 2.03-.84 3.37-.74 1.4.09 2.61.53 3.48 1.29-1.43 1.04-2.14 2.42-1.98 4.15.16 1.72 1.15 3.02 2.53 3.84-.55 1.29-1.37 2.5-2.48 3.63zM14.07 4.4c.72-.9 1.13-2.12.98-3.4-.98.07-2.13.59-2.85 1.48-.66.81-1.07 1.98-.93 3.18 1.04.04 2.14-.52 2.8-1.26z" />
                  </svg>
                  <span>
                    {isLoading && selectedProvider === 'apple'
                      ? 'Creating account...'
                      : 'Continue with Apple'}
                  </span>
                </button>

                <div className={styles.divider}>
                  <div className={styles.dividerLine}></div>
                  <span className={styles.dividerText}>or</span>
                </div>

                <button
                  onClick={() => setShowEmailForm(true)}
                  className={styles.socialButton}
                >
                  <svg
                    className={styles.socialIcon}
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
                  <span>Sign up with Email</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailSignup} className={styles.emailForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${styles.formInput} ${
                      errors.name ? styles.formInputError : ''
                    }`}
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <div className={styles.errorMessage}>{errors.name}</div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${styles.formInput} ${
                      errors.email ? styles.formInputError : ''
                    }`}
                    placeholder="you@company.com"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <div className={styles.errorMessage}>{errors.email}</div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${styles.formInput} ${
                      errors.password ? styles.formInputError : ''
                    }`}
                    placeholder="Create a strong password"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <div className={styles.errorMessage}>{errors.password}</div>
                  )}
                  <div className={styles.passwordHint}>
                    Must be at least 8 characters
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={styles.submitButton}
                >
                  {isLoading && selectedProvider === 'email'
                    ? 'Creating account...'
                    : 'Create Account'}
                </button>

                <div className={styles.backLink}>
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className={styles.backButton}
                  >
                    ← Back to all sign up options
                  </button>
                </div>
              </form>
            )}

            <div className={styles.formFooter}>
              <p className={styles.footerText}>
                Already have an account?{' '}
                <a href="/auth/login" className={styles.footerLink}>
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
