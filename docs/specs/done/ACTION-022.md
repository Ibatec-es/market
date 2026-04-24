# ACTION-022 — Implementar Landing — Proceso y CTA final

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-021 completada. Sección ValueProps implementada.

## Objetivo

Crear las dos secciones finales de la landing: `Process` (cómo funciona, pasos numerados) y `CtaSection` (llamada a acción de cierre). Ambas se alimentan del `landing.json` definido en ACTION-019.

## Archivos a crear

```
src/brand/components/Landing/
├── Process.tsx
├── Process.module.css
├── CtaSection.tsx
└── CtaSection.module.css
```

---

## Sección Process

### `Process.module.css`

```css
/* src/brand/components/Landing/Process.module.css */

.section {
  padding: var(--space-20) 0;
  background-color: var(--color-bg-primary);
}

.inner {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-pad);
}

.header {
  text-align: center;
  margin-bottom: var(--space-12);
}

.title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
  position: relative;
}

/* Línea conectora entre pasos — solo desktop */
.steps::before {
  content: '';
  position: absolute;
  top: 20px; /* Alineado al centro del número */
  left: calc(50% / 3);
  right: calc(50% / 3);
  height: 1px;
  background-color: var(--color-border);
  z-index: 0;
}

.step {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  position: relative;
  z-index: 1;
}

.stepNumber {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background-color: var(--color-bg-primary);
  border: 2px solid var(--color-action-primary);
  color: var(--color-action-primary);
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stepTitle {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.stepDescription {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0;
}

@media (max-width: 768px) {
  .steps {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .steps::before {
    display: none;
  }

  .step {
    flex-direction: row;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .stepContent {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
}
```

### `Process.tsx`

```typescript
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
```

---

## Sección CtaSection

### `CtaSection.module.css`

```css
/* src/brand/components/Landing/CtaSection.module.css */

.section {
  padding: var(--space-20) 0;
  background-color: var(--color-action-primary-bg);
  border-top: var(--card-border);
  border-bottom: var(--card-border);
}

.inner {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-pad);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-6);
}

.headline {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  max-width: 560px;
}

.subheadline {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0;
  max-width: 480px;
}

.cta {
  display: inline-flex;
  align-items: center;
  padding: var(--space-3) var(--space-8);
  background-color: var(--color-action-primary);
  color: var(--color-action-primary-text);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: background-color var(--transition-base);
}

.cta:hover {
  background-color: var(--color-action-primary-hover);
}

@media (max-width: 640px) {
  .headline {
    font-size: var(--text-2xl);
  }

  .cta {
    width: 100%;
    justify-content: center;
  }
}
```

### `CtaSection.tsx`

```typescript
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
```

---

## Verificación de las dos secciones

```bash
npm run dev
```

Importar temporalmente en una página de prueba:

```typescript
import { getLandingContent } from '../brand/utils/getLandingContent'
import Process from '../brand/components/Landing/Process'
import CtaSection from '../brand/components/Landing/CtaSection'

const content = getLandingContent()
// <Process content={content.process} />
// <CtaSection content={content.cta} />
```

Verificar:

- [ ] Process: 3 pasos en desktop (grid 3 col), vertical en mobile con número a la izquierda
- [ ] Línea conectora visible entre pasos en desktop
- [ ] CtaSection: fondo de color de acción, headline, subheadline, botón único
- [ ] Botón de CTA navega correctamente

## Qué evitar

- No añadir animaciones de scroll todavía. Primero funcional, luego refinamiento.
- No cambiar el número de pasos hardcodeando índices. Siempre `.map()` sobre el array.
- No mezclar estilos de Process y CtaSection en un solo archivo CSS.

## Entregable

- `Process.tsx` + `Process.module.css`
- `CtaSection.tsx` + `CtaSection.module.css`
- Ambas secciones renderizan sin errores con los datos del JSON.

## Criterio de hecho

Ambas secciones renderizan correctamente en desktop y mobile. Todo el contenido viene del JSON. `npm run build` sin errores.
