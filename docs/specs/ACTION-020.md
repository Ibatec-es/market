# ACTION-020 — Implementar componente Landing — Hero

## Contexto del proyecto

Estado previo: ACTION-019 completada. Contenido de landing definido en JSON.

## Objetivo

Crear la sección Hero de la landing en `src/brand/components/Landing/Hero.tsx`.

## Estructura a crear

```
src/brand/components/Landing/
├── Hero.tsx
└── Hero.module.css
```

## Implementar `Hero.module.css`

```css
/* src/brand/components/Landing/Hero.module.css */

.hero {
  padding: var(--space-20) 0 var(--space-16);
  background-color: var(--color-bg-primary);
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

.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-4);
  background-color: var(--color-action-primary-bg);
  color: var(--color-action-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.headline {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  max-width: 720px;
  margin: 0;
}

.subheadline {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  max-width: 560px;
  margin: 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
  justify-content: center;
  padding-top: var(--space-2);
}

.ctaPrimary {
  display: inline-flex;
  align-items: center;
  padding: var(--space-3) var(--space-6);
  background-color: var(--color-action-primary);
  color: var(--color-action-primary-text);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: background-color var(--transition-base);
}

.ctaPrimary:hover {
  background-color: var(--color-action-primary-hover);
}

.ctaSecondary {
  display: inline-flex;
  align-items: center;
  padding: var(--space-3) var(--space-6);
  background-color: transparent;
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  border: var(--card-border);
  text-decoration: none;
  transition: var(--transition-colors);
}

.ctaSecondary:hover {
  border-color: var(--color-border-strong);
  background-color: var(--color-bg-secondary);
}

@media (max-width: 768px) {
  .headline {
    font-size: var(--text-3xl);
  }

  .subheadline {
    font-size: var(--text-base);
  }

  .actions {
    flex-direction: column;
    width: 100%;
  }

  .ctaPrimary,
  .ctaSecondary {
    width: 100%;
    justify-content: center;
  }
}
```

## Implementar `Hero.tsx`

```typescript
// src/brand/components/Landing/Hero.tsx

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
```

## Verificación rápida

Importar temporalmente en una página para verificar que renderiza:

```typescript
// Prueba temporal en cualquier página
import Hero from '../brand/components/Landing/Hero'
import { getLandingContent } from '../brand/utils/getLandingContent'

const content = getLandingContent()
// <Hero content={content.hero} />
```

## Qué evitar

- No añadir imagen de fondo o ilustración en esta acción. El Hero funciona sin ellas.
- No hardcodear ningún texto.
- No crear efectos de animación complejos todavía.

## Entregable

- `src/brand/components/Landing/Hero.tsx` y `Hero.module.css`.
- El componente renderiza sin errores con los datos del JSON.

## Criterio de hecho

El Hero renderiza headline, subheadline, badge y CTAs desde el JSON. Es responsive. `npm run build` sin errores.
