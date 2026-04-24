# ACTION-016 — Implementar Footer corporativo

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-015 completada. Header corporativo funcionando.

## Objetivo de esta acción

Crear `src/brand/components/Footer/index.tsx` como reemplazo del Footer del core. Tres columnas en desktop, una en mobile. Completamente alimentado por configuración.

## Paso 1 — Analizar el Footer del core

```bash
cat src/components/Footer/Footer.tsx
cat src/components/Footer/Links.tsx
```

Identificar:

- Qué datos lee de `siteContent` (estructura del footer en `content/site.json`)
- Qué está hardcodeado (logo, redes sociales, copyright)
- Qué props recibe

Revisar la estructura del footer en `content/site.json`:

```bash
cat content/site.json | grep -A 30 '"footer"'
```

## Paso 2 — Extender `brand/content/default/site.json`

Si el `site.json` del core no tiene suficientes datos para el footer corporativo, extenderlo:

```json
// src/brand/content/default/site.json
{
  "footer": {
    "tagline": "Marketplace de datos para empresas",
    "social": {
      "twitter": "https://twitter.com/ibatec",
      "linkedin": "https://linkedin.com/company/ibatec",
      "github": "https://github.com/Ibatec-es"
    },
    "columns": [
      {
        "title": "Producto",
        "links": [
          { "label": "Explorar datos", "href": "/search" },
          { "label": "Publicar dataset", "href": "/publish" }
        ]
      },
      {
        "title": "Legal",
        "links": [
          { "label": "Privacidad", "href": "/privacy" },
          { "label": "Términos", "href": "/terms" }
        ]
      }
    ],
    "copyright": "© 2026 Ibatec. Todos los derechos reservados."
  }
}
```

Ajustar la estructura según los campos que ya existen en el `site.json` base.

## Paso 3 — Estructura de archivos a crear

```
src/brand/components/Footer/
├── index.tsx
└── Footer.module.css
```

## Paso 4 — Implementar `Footer.module.css`

```css
/* src/brand/components/Footer/Footer.module.css */

.footer {
  border-top: var(--card-border);
  background-color: var(--color-bg-primary);
  padding: var(--space-12) 0 var(--space-8);
}

.inner {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-pad);
}

.grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--space-12);
  margin-bottom: var(--space-10);
}

/* Columna de marca */
.brand {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.tagline {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  max-width: 280px;
}

.social {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.socialLink {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: var(--transition-colors);
  border: var(--card-border);
}

.socialLink:hover {
  color: var(--color-text-primary);
  border-color: var(--color-border-strong);
}

/* Columnas de enlaces */
.column {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.columnTitle {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.link {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: var(--transition-colors);
}

.link:hover {
  color: var(--color-text-primary);
}

/* Copyright */
.bottom {
  padding-top: var(--space-6);
  border-top: var(--card-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.copyright {
  font-size: var(--text-xs);
  color: var(--color-text-disabled);
}

/* Mobile */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }

  .bottom {
    flex-direction: column;
    gap: var(--space-3);
    align-items: flex-start;
  }
}
```

## Paso 5 — Implementar `index.tsx`

```typescript
// src/brand/components/Footer/index.tsx

import Link from 'next/link'
import { useMarketMetadata } from '../../../@context/MarketMetadata'
import { BrandLogo } from '../../resolver'
import styles from './Footer.module.css'

export default function Footer() {
  const { siteContent } = useMarketMetadata()
  const footer = siteContent?.footer

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Columna de marca */}
          <div className={styles.brand}>
            <Link href="/" aria-label="Ir a inicio">
              <BrandLogo
                src="/brand/assets/default/logo.svg"
                alt={siteContent?.siteTitle ?? 'Market'}
                width={100}
                height={28}
              />
            </Link>
            {footer?.tagline && (
              <p className={styles.tagline}>{footer.tagline}</p>
            )}
            {footer?.social && (
              <div className={styles.social}>
                {footer.social.twitter && (
                  <a
                    href={footer.social.twitter}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                  >
                    𝕏
                  </a>
                )}
                {footer.social.linkedin && (
                  <a
                    href={footer.social.linkedin}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    in
                  </a>
                )}
                {footer.social.github && (
                  <a
                    href={footer.social.github}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                  >
                    gh
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Columnas de enlaces */}
          {footer?.columns?.map(
            (col: {
              title: string
              links: { label: string; href: string }[]
            }) => (
              <div key={col.title} className={styles.column}>
                <p className={styles.columnTitle}>{col.title}</p>
                {col.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={styles.link}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )
          )}
        </div>

        {/* Copyright */}
        <div className={styles.bottom}>
          <span className={styles.copyright}>
            {footer?.copyright ?? `© ${new Date().getFullYear()} Market`}
          </span>
        </div>
      </div>
    </footer>
  )
}
```

## Paso 6 — Registrar en el resolver

```typescript
// src/brand/resolver.ts

// ANTES:
export { default as BrandFooter } from '../components/Footer/Footer'

// DESPUÉS:
export { default as BrandFooter } from './components/Footer'
```

## Verificación

```bash
npm run dev
```

Verificar en desktop y mobile:

- [ ] Logo en columna de marca
- [ ] Tagline visible
- [ ] Social links abren correctamente
- [ ] Columnas de enlaces funcionales
- [ ] Copyright correcto
- [ ] Layout responsive (3 col → 1 col en mobile)

## Qué evitar

- No hardcodear texto. Todo de `siteContent`.
- No usar `<table>` para el layout. CSS Grid.
- No añadir iconos como imágenes externas en esta acción. Usar texto/unicode como placeholder.

## Entregable

- `src/brand/components/Footer/` implementado.
- Resolver actualizado.
- Footer visible en toda la app.

## Criterio de hecho

Footer corporativo visible en todas las rutas. Layout responsive correcto. Todo el contenido viene de configuración. `npm run build` sin errores.
