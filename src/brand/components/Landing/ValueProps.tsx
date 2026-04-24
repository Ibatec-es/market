// src/brand/components/Landing/ValueProps.tsx

import type { ValueProp } from '../../types/landing'
import styles from './ValueProps.module.css'

interface ValuePropsSection {
  title: string
  items: ValueProp[]
}

interface ValuePropsProps {
  content: ValuePropsSection
}

export default function ValueProps({ content }: ValuePropsProps) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>{content.title}</h2>
        </div>

        <div className={styles.grid}>
          {content.items.map((item) => (
            <article key={item.id} className={styles.card}>
              <span className={styles.icon} aria-hidden="true">
                {item.icon}
              </span>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDescription}>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
