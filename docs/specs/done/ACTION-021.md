# ACTION-021 — Implementar Landing — Propuesta de valor

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-020 completada. Sección Hero implementada.

## Objetivo

Crear la sección de propuesta de valor (`ValueProps`) de la landing. Grid de 3-4 columnas en desktop, 1 columna en mobile. Cada bloque tiene icono, título y descripción corta.

## Archivos a crear

```
src/brand/components/Landing/
├── ValueProps.tsx
└── ValueProps.module.css
```

## Implementar `ValueProps.module.css`

```css
/* src/brand/components/Landing/ValueProps.module.css */

.section {
  padding: var(--space-20) 0;
  background-color: var(--color-bg-secondary);
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

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);
}

.card {
  background-color: var(--color-bg-primary);
  border: var(--card-border);
  border-radius: var(--card-radius);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: border-color var(--transition-base);
}

.card:hover {
  border-color: var(--color-border-strong);
}

.icon {
  font-size: var(--text-2xl);
  line-height: 1;
  /* En producción, sustituir emoji por componente de icono SVG */
}

.cardTitle {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.cardDescription {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

## Implementar `ValueProps.tsx`

```typescript
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
```

## Nota sobre iconos

Los emojis son un placeholder funcional. En una iteración posterior, sustituir por una librería de iconos SVG (por ejemplo `lucide-react`, que es ligera y tree-shakeable):

```bash
npm install lucide-react
```

Para esa sustitución, el campo `icon` del JSON pasará de ser un emoji a ser un nombre de icono: `"icon": "ShieldCheck"`. El componente hará `const Icon = icons[item.icon]` y renderizará `<Icon />`. Eso va en una acción de refinamiento posterior.

## Entregable

- `src/brand/components/Landing/ValueProps.tsx` y `ValueProps.module.css`.
- El componente renderiza correctamente con los datos del JSON.

## Criterio de hecho

Grid de 4 columnas en desktop, 2 en tablet, 1 en mobile. Cards con borde y sin sombra. Todo el contenido desde el JSON. `npm run build` sin errores.
