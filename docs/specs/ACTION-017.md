# ACTION-017 — Implementar componente Logo corporativo

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-016 completada. Footer corporativo funcionando.

## Objetivo de esta acción

Crear `src/brand/components/Logo/index.tsx` como wrapper del Logo del core que resuelve automáticamente el asset correcto según `NEXT_PUBLIC_BRAND_ID`. Reemplazar los `src` hardcodeados en Header y Footer por este componente.

## Implementar `src/brand/components/Logo/index.tsx`

```typescript
// src/brand/components/Logo/index.tsx

import CoreLogo from '../../../components/@shared/atoms/Logo'

const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || 'default'

// Mapa de logos por brand — añadir entradas al incorporar nuevos clientes
const LOGO_MAP: Record<string, string> = {
  default: '/brand/assets/default/logo.svg'
  // 'acme-corp': '/brand/assets/acme-corp/logo.svg',
}

interface BrandLogoProps {
  alt?: string
  className?: string
  width?: number
  height?: number
  variant?: 'default' | 'dark' // para variante fondo oscuro si existe
}

export default function BrandLogo({
  alt = 'Logo',
  className,
  width = 120,
  height = 32,
  variant = 'default'
}: BrandLogoProps) {
  const logoKey = variant === 'dark' ? `${BRAND_ID}-dark` : BRAND_ID
  const src = LOGO_MAP[logoKey] ?? LOGO_MAP[BRAND_ID] ?? LOGO_MAP['default']

  return (
    <CoreLogo
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
    />
  )
}
```

> **Nota sobre assets públicos:** Los SVGs del logo deben estar en la carpeta `public/` de Next.js para ser accesibles como rutas `/brand/assets/...`. Mover los assets:

```bash
mkdir -p public/brand/assets/default
cp src/brand/assets/default/logo.svg public/brand/assets/default/logo.svg
```

La carpeta `src/brand/assets/` se mantiene como fuente de verdad de los originales. La carpeta `public/brand/assets/` es la que sirve Next.js.

## Actualizar el resolver

```typescript
// src/brand/resolver.ts

// ANTES:
export { default as BrandLogo } from '../components/@shared/atoms/Logo'

// DESPUÉS:
export { default as BrandLogo } from './components/Logo'
```

## Actualizar Header y Footer

En `src/brand/components/Header/index.tsx` y `Footer/index.tsx`, el import de `BrandLogo` ya viene del resolver, por lo que automáticamente usará el nuevo componente. Verificar que el `src` prop ya no se pasa hardcodeado — el nuevo `BrandLogo` lo resuelve internamente:

```typescript
// Antes en Header:
<BrandLogo src="/brand/assets/default/logo.svg" alt="..." />

// Después — BrandLogo resuelve el src internamente:
<BrandLogo alt={siteContent?.siteTitle} />
```

## Verificación

```bash
npm run dev
```

- [ ] Logo se renderiza en Header
- [ ] Logo se renderiza en Footer
- [ ] Cambiar `NEXT_PUBLIC_BRAND_ID` en `.env.local` a un valor inexistente → debe usar el logo `default` como fallback

## Entregable

- `src/brand/components/Logo/index.tsx` implementado.
- Assets en `public/brand/assets/default/`.
- Resolver actualizado.
- Header y Footer usando el nuevo BrandLogo sin prop `src` hardcodeada.

## Criterio de hecho

Logo resuelto dinámicamente por BRAND_ID. Fallback a `default` si el brand ID no existe. `npm run build` sin errores.

---
