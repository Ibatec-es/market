import Logo from '@images/logo.svg'
import styles from './LeftColumn.module.css'

interface LeftColumnProps {
  content: {
    title: string
    description: string
    features: Array<{ icon: string; text: string }>
  }
}

export default function LeftColumn({ content }: LeftColumnProps) {
  const features = content.features || [
    { icon: '⛽', text: 'Gasless transactions - No ETH/MATIC needed' },
    { icon: '🏢', text: 'Organizational wallets for teams' },
    { icon: '🔒', text: 'Enterprise-grade security with multisig' },
    { icon: '⚡', text: 'Batched transactions for efficiency' }
  ]

  return (
    <div className={styles.leftColumn}>
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.logoWrapper}>
            <Logo />
          </div>

          <h1 className={styles.title}>
            {content.title || 'Enterprise Data Marketplace'}
          </h1>

          <p className={styles.description}>
            {content.description ||
              'Monetize your data assets with institutional-grade security, gasless transactions, and organizational wallets.'}
          </p>

          <div className={styles.features}>
            {features.map((feature, index) => (
              <div key={index} className={styles.feature}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <span className={styles.featureText}>{feature.text}</span>
              </div>
            ))}
          </div>

          <div className={styles.trustBadges}>
            <p className={styles.trustTitle}>
              Trusted by enterprises worldwide
            </p>
            <div className={styles.badges}>
              <span className={styles.badge}>SOC 2 Type II</span>
              <span className={styles.badge}>GDPR Compliant</span>
              <span className={styles.badge}>ISO 27001</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
