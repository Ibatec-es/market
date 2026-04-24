# ACTION-019 — Crear contenido de la landing en brand config

## Contexto del proyecto

Estado previo: ACTION-018 completada. Tag `v3-shell-ready`. Shell corporativo operativo.

Esta acción inicia la Fase 4 — Landing corporativa.

## Objetivo

Definir todos los textos e imágenes de la landing como datos JSON en `src/brand/content/default/landing.json`. La landing no tendrá texto hardcodeado.

## Crear el tipo TypeScript

```typescript
// src/brand/types/landing.ts

export interface HeroContent {
  headline: string
  subheadline: string
  ctaPrimary: { label: string; href: string }
  ctaSecondary?: { label: string; href: string }
  badge?: string // Texto de etiqueta encima del headline (opcional)
}

export interface ValueProp {
  id: string
  icon: string // nombre de icono o emoji de placeholder
  title: string
  description: string
}

export interface ProcessStep {
  number: number
  title: string
  description: string
}

export interface CtaSection {
  headline: string
  subheadline?: string
  cta: { label: string; href: string }
}

export interface LandingContent {
  hero: HeroContent
  valueProps: {
    title: string
    items: ValueProp[]
  }
  process: {
    title: string
    steps: ProcessStep[]
  }
  cta: CtaSection
}
```

## Crear `src/brand/content/default/landing.json`

```json
{
  "hero": {
    "badge": "Marketplace de datos empresariales",
    "headline": "Accede, publica y monetiza datos con total soberanía",
    "subheadline": "Plataforma descentralizada para el intercambio seguro de datasets, APIs y modelos de datos entre empresas.",
    "ctaPrimary": {
      "label": "Explorar datasets",
      "href": "/search"
    },
    "ctaSecondary": {
      "label": "Publicar datos",
      "href": "/publish"
    }
  },
  "valueProps": {
    "title": "Por qué Ibatec Market",
    "items": [
      {
        "id": "ownership",
        "icon": "🔐",
        "title": "Soberanía de datos",
        "description": "Controla quién accede a tus datos y en qué condiciones. Sin intermediarios que custodien tu información."
      },
      {
        "id": "interop",
        "icon": "🔗",
        "title": "Interoperabilidad",
        "description": "Compatible con los principales estándares de datos y blockchain. Integra con tus sistemas existentes."
      },
      {
        "id": "monetize",
        "icon": "💰",
        "title": "Monetización directa",
        "description": "Define el precio y las condiciones de acceso a tus datasets. Los ingresos van directamente a tu wallet."
      },
      {
        "id": "audit",
        "icon": "📋",
        "title": "Trazabilidad completa",
        "description": "Registro inmutable de cada acceso y transacción. Cumplimiento normativo sin esfuerzo adicional."
      }
    ]
  },
  "process": {
    "title": "Cómo funciona",
    "steps": [
      {
        "number": 1,
        "title": "Conecta tu wallet",
        "description": "Usa tu wallet Web3 para identificarte de forma segura. Sin registro, sin contraseñas."
      },
      {
        "number": 2,
        "title": "Explora o publica",
        "description": "Navega el catálogo de datasets disponibles o publica los tuyos con tus condiciones de acceso."
      },
      {
        "number": 3,
        "title": "Accede con confianza",
        "description": "Las transacciones se ejecutan en blockchain. El acceso a los datos se verifica automáticamente."
      }
    ]
  },
  "cta": {
    "headline": "Empieza a trabajar con datos de calidad",
    "subheadline": "Sin contratos largos. Sin gestión de infraestructura. Solo datos.",
    "cta": {
      "label": "Explorar el marketplace",
      "href": "/search"
    }
  }
}
```

## Crear loader del contenido de landing

```typescript
// src/brand/utils/getLandingContent.ts
import type { LandingContent } from '../types/landing'

export function getLandingContent(): LandingContent {
  const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || 'default'
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(`../content/${BRAND_ID}/landing.json`) as LandingContent
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('../content/default/landing.json') as LandingContent
  }
}
```

## Entregable

- `src/brand/types/landing.ts` con los tipos completos.
- `src/brand/content/default/landing.json` con el contenido real o de alta calidad.
- `src/brand/utils/getLandingContent.ts`.

## Criterio de hecho

El JSON es válido, tipado y contiene contenido coherente. TypeScript no produce errores al importar los tipos.

---
