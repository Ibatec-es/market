# ACTION-023 — Integrar Landing en la ruta principal

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-022 completada. Hero, ValueProps, Process y CtaSection implementados.

## Objetivo

Componer el componente `Landing` completo uniendo las cuatro secciones y conectarlo con la ruta `/` mediante `src/pages/index.tsx`. Cuando `NEXT_PUBLIC_BRAND_ID` no sea `default` vacío, la ruta `/` muestra la landing corporativa. El comportamiento con el core Home original se preserva como fallback.

## Paso 1 — Crear el componente Landing compositor

```
src/brand/components/Landing/
└── index.tsx   ← nuevo
```

```typescript
// src/brand/components/Landing/index.tsx

import { getLandingContent } from '../../utils/getLandingContent'
import Hero from './Hero'
import ValueProps from './ValueProps'
import Process from './Process'
import CtaSection from './CtaSection'

export default function Landing() {
  const content = getLandingContent()

  return (
    <main>
      <Hero content={content.hero} />
      <ValueProps content={content.valueProps} />
      <Process content={content.process} />
      <CtaSection content={content.cta} />
    </main>
  )
}
```

## Paso 2 — Analizar `src/pages/index.tsx` del core

```bash
cat src/pages/index.tsx
```

El archivo del core probablemente tiene esta forma:

```typescript
// core/pages/index.tsx (aproximado)
import type { NextPage } from 'next'
import Page from '../components/@shared/Page'
import Home from '../components/Home'

const HomePage: NextPage = () => {
  return (
    <Page title="Home" description="..." isHome>
      <Home />
    </Page>
  )
}

export default HomePage
```

Entender cómo gestiona el wrapper `Page` y el SEO. La landing corporativa necesita gestionar su propio SEO (title, description, og:image) sin depender del wrapper `Page` del core.

## Paso 3 — Modificar `src/pages/index.tsx`

Esta es la quinta y última modificación al core. Minimalista: añadir un condicional para renderizar la landing brand cuando está activa.

```typescript
// src/pages/index.tsx

import type { NextPage } from 'next'
import Head from 'next/head'
import { useMarketMetadata } from '../@context/MarketMetadata'

// Core home — se mantiene intacto como fallback
import CoreHome from '../components/Home'
import Page from '../components/@shared/Page'

// Brand landing — solo se carga cuando está configurada
// El import dinámico evita añadir el bundle de la landing al chunk de la home del core
import dynamic from 'next/dynamic'
const BrandLanding = dynamic(() => import('../brand/components/Landing'), {
  ssr: true
})

// Flag para activar la landing corporativa
// Se considera activa si existe contenido de landing para el brand actual
const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || 'default'
const USE_BRAND_LANDING = BRAND_ID !== ''

const HomePage: NextPage = () => {
  const { siteContent } = useMarketMetadata()

  if (USE_BRAND_LANDING) {
    return (
      <>
        <Head>
          <title>{siteContent?.siteTitle ?? 'Market'}</title>
          <meta
            name="description"
            content={
              siteContent?.siteTagline ?? 'Marketplace de datos empresariales'
            }
          />
        </Head>
        <BrandLanding />
      </>
    )
  }

  // Fallback: home original del core
  return (
    <Page
      title={siteContent?.siteTitle}
      description={siteContent?.siteTagline}
      isHome
    >
      <CoreHome />
    </Page>
  )
}

export default HomePage
```

> **Nota sobre el flag `USE_BRAND_LANDING`:** Por ahora se activa siempre que `BRAND_ID` esté definido (que es siempre, ya que tiene valor por defecto `'default'`). Si se quiere poder desactivar la landing brand y mostrar la del core, cambiar la condición a algo como `BRAND_ID !== 'core'` o añadir una variable de entorno específica `NEXT_PUBLIC_USE_BRAND_LANDING=true`.

## Paso 4 — Verificar el SEO de la landing

La landing corporativa gestiona su propio `<Head>`. Verificar que se renderiza correctamente:

```bash
npm run dev
# Abrir http://localhost:3000
# View Source → verificar <title> y <meta description>
```

Verificar también la etiqueta `og:image` si el proyecto la usa. Si `siteContent` tiene un campo para la imagen OG, incluirlo:

```typescript
{
  siteContent?.siteOgImage && (
    <meta property="og:image" content={siteContent.siteOgImage} />
  )
}
```

## Paso 5 — Documentar la modificación

Añadir a `docs/fork-diff.md`:

```markdown
## MOD-005 — `src/pages/index.tsx`

**Tipo:** Condicional de renderizado  
**Cambio:** Si `NEXT_PUBLIC_BRAND_ID` está activo, renderiza `brand/components/Landing` en lugar del `Home` del core  
**Comportamiento sin brand:** El `Home` del core renderiza normalmente  
**Comportamiento con brand:** La landing corporativa reemplaza la home  
**Motivo:** Separar la landing de marca de la implementación demo del core  
**Riesgo de conflicto en merge:** Medio. Si upstream modifica `pages/index.tsx`, revisar que el condicional sigue aplicándose correctamente sobre la nueva implementación del core.  
**Acción en merge:** Mantener el bloque condicional. Aplicar cambios del upstream en el bloque `else` (fallback al core).
```

## Paso 6 — Verificación completa

```bash
npm run dev
```

- [ ] Ruta `/` muestra la landing corporativa (Hero + ValueProps + Process + CtaSection)
- [ ] La landing tiene el shell corporativo (Header + Footer)
- [ ] El `<title>` y `<meta description>` son correctos
- [ ] Los CTAs del Hero navegan correctamente al catálogo
- [ ] El botón de CTA final navega correctamente
- [ ] La landing es correcta en mobile (375px)

Probar el fallback cambiando `USE_BRAND_LANDING` a `false` temporalmente:

- [ ] La home original del core se renderiza correctamente

Revertir el cambio de prueba después.

```bash
npm run build
# Verificar que el dynamic import no genera warnings
```

## Qué evitar

- No eliminar el import de `CoreHome`. El fallback debe seguir funcionando.
- No gestionar el SEO dentro del componente `Landing/index.tsx`. El SEO se gestiona en la página (`pages/index.tsx`), no en el componente.
- No usar `getServerSideProps` ni `getStaticProps` en esta página si el core no los usa. Mantener la coherencia con la estrategia de renderizado del resto del proyecto.

## Entregable

- `src/brand/components/Landing/index.tsx` compositor implementado.
- `src/pages/index.tsx` con el condicional de brand landing.
- `docs/fork-diff.md` actualizado con MOD-005.
- La ruta `/` muestra la landing corporativa completa.

## Criterio de hecho

La landing corporativa se renderiza en `/` con shell, SEO y todas las secciones. El fallback al core funciona. `npm run build` sin errores ni warnings relevantes.
