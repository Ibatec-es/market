import Link from 'next/link'
import type { HeroContent } from '../../types/landing'
import styles from './Hero.module.css'

interface HeroProps {
  content: HeroContent
}

export default function Hero({ content }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        {content.badge && <span className={styles.badge}>{content.badge}</span>}

        <h1 className={styles.headline}>{content.headline}</h1>

        <p className={styles.subheadline}>{content.subheadline}</p>

        <div className={styles.actions}>
          <Link href={content.ctaPrimary.href} className={styles.ctaPrimary}>
            {content.ctaPrimary.label}
          </Link>

          {content.ctaSecondary && (
            <Link
              href={content.ctaSecondary.href}
              className={styles.ctaSecondary}
            >
              {content.ctaSecondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
