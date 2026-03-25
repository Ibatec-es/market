import Logo from '@images/logo.svg'
import styles from './LeftColumn.module.css'

interface LeftColumnProps {
  content: {
    title: string
    benefits: Array<{ icon: string; title: string; description: string }>
  }
}

export default function LeftColumn({ content }: LeftColumnProps) {
  const benefits = content.benefits || [
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

  return (
    <div className={styles.leftColumn}>
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.logoWrapper}>
            <Logo />
          </div>

          <h1 className={styles.title}>
            {content.title || 'Start monetizing your data assets today'}
          </h1>

          <div className={styles.benefits}>
            {benefits.map((benefit, index) => (
              <div key={index} className={styles.benefit}>
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
    </div>
  )
}
