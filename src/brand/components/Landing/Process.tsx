// src/brand/components/Landing/Process.tsx

import type { ProcessStep } from '../../types/landing'
import styles from './Process.module.css'

interface ProcessContent {
  title: string
  steps: ProcessStep[]
}

interface ProcessProps {
  content: ProcessContent
}

export default function Process({ content }: ProcessProps) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>{content.title}</h2>
        </div>

        <div className={styles.steps}>
          {content.steps.map((step) => (
            <div key={step.number} className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">
                {step.number}
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
