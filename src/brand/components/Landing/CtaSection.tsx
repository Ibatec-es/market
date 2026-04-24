// src/brand/components/Landing/CtaSection.tsx

import Link from 'next/link'
import type { CtaSection as CtaSectionType } from '../../types/landing'
import styles from './CtaSection.module.css'

interface CtaSectionProps {
  content: CtaSectionType
}

export default function CtaSection({ content }: CtaSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.headline}>{content.headline}</h2>

        {content.subheadline && (
          <p className={styles.subheadline}>{content.subheadline}</p>
        )}

        <Link href={content.cta.href} className={styles.cta}>
          {content.cta.label}
        </Link>
      </div>
    </section>
  )
}
