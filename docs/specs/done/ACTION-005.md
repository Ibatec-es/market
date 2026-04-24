# ACTION-005 — Implementar el resolver de componentes

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-004 completada. Estructura `src/brand/` creada. Variable `NEXT_PUBLIC_BRAND_ID` configurada.

## Objetivo de esta acción

Implementar `src/brand/resolver.ts` como el punto único desde el que el resto del proyecto importa los componentes de shell. El resolver decide en build time si cargar el componente custom de la capa brand o el del core, según `NEXT_PUBLIC_BRAND_ID` y la existencia de implementaciones custom.

Cuando esta acción termine, el resolver exportará los mismos componentes del core (sin cambio de comportamiento), pero la arquitectura ya estará lista para recibir implementaciones custom.

## Contexto técnico importante

Next.js resuelve los imports en build time. No se puede hacer resolución dinámica de módulos con `require()` condicional en runtime de forma limpia en todos los entornos. La estrategia correcta es usar **re-exports estáticos** que se actualizan cuando se añade un componente custom.

El resolver no es un factory dinámico en runtime — es un módulo de re-exports que actúa como indirección. La "lógica" de resolución es simplemente qué se exporta desde este archivo.

## Implementación de `src/brand/resolver.ts`

```typescript
/**
 * Brand Resolver
 *
 * Punto único de resolución de componentes de shell.
 * Importar siempre desde aquí, nunca directamente del core ni de brand/components/.
 *
 * Para activar un componente custom:
 * 1. Implementarlo en src/brand/components/[Slot]/index.tsx
 * 2. Actualizar el export correspondiente en este archivo.
 *
 * BRAND_ID actual: process.env.NEXT_PUBLIC_BRAND_ID
 */

// --- Header ---
// Cuando exista src/brand/components/Header/index.tsx, cambiar este import.
export { default as BrandHeader } from '../components/Header'
// export { default as BrandHeader } from './components/Header'  // ← activar cuando esté listo

// --- Footer ---
export { default as BrandFooter } from '../components/Footer/Footer'
// export { default as BrandFooter } from './components/Footer'

// --- Logo ---
export { default as BrandLogo } from '../components/@shared/atoms/Logo'
// export { default as BrandLogo } from './components/Logo'

// --- App Shell ---
// El shell (App/index.tsx) no se exporta aquí — se modifica directamente en ACTION-007.
// Este slot existe como documentación del patrón.

// --- Landing ---
// La landing se resuelve en src/pages/index.tsx, no aquí.
// Se documenta en ACTION-023.
```

> **Nota para el LLM:** Los paths de import del core (`../components/Header`, etc.) deben verificarse contra la estructura real del proyecto antes de escribir el archivo. Los paths anteriores son aproximados.

## Verificar los paths reales del core

Antes de escribir el resolver, confirmar las rutas exactas:

```bash
# Verificar dónde está el Header del core
find src/components -name "index.tsx" | grep -i header
find src/components -name "*.tsx" | grep -i footer
find src/components -name "index.tsx" | grep -i logo
```

Ajustar los imports del resolver según los paths reales encontrados.

## Tipos TypeScript

El resolver debe ser compatible en tipos con lo que el core espera. Verificar que los componentes re-exportados tienen tipos exportados o inferibles.

Si algún componente del core no tiene un tipo de props explícito, crear una interfaz mínima en `src/brand/types/shell.ts`:

```typescript
// src/brand/types/shell.ts

export interface BrandHeaderProps {
  // Completar con las props reales del Header del core
}

export interface BrandFooterProps {
  // Completar con las props reales del Footer del core
}

export interface BrandLogoProps {
  src?: string
  alt?: string
  className?: string
}
```

## Verificación

```bash
npm run dev
# La app debe comportarse exactamente igual
npm run build
# Debe compilar sin errores de TypeScript
```

Importar desde el resolver en un archivo temporal para verificar que los tipos son correctos:

```typescript
// test-import (borrar después)
import { BrandHeader, BrandFooter, BrandLogo } from '../brand/resolver'
// Si TypeScript no se queja, los tipos son compatibles.
```

## Patrón a seguir

El resolver es un archivo que **solo crece**: nunca se elimina un export, solo se sustituye la fuente del import. Esto garantiza que el contrato de la arquitectura es estable.

Cuando se implemente un componente custom (por ejemplo en ACTION-015), el cambio en el resolver es una sola línea:

```typescript
// Antes:
export { default as BrandHeader } from '../components/Header'
// Después:
export { default as BrandHeader } from './components/Header'
```

Ese diff de una línea es suficiente para activar el componente corporativo en toda la app.

## Qué evitar

- No añadir lógica condicional en runtime (`if (brandId === 'x')`). El resolver es estático.
- No importar desde el resolver dentro del propio directorio `brand/`. Los componentes brand no se importan entre sí a través del resolver — se importan directamente.
- No exportar componentes de páginas (`Home`, `SearchPage`, etc.). El resolver solo gestiona shell: Header, Footer, Logo.
- No renombrar los exports una vez definidos. `BrandHeader` es `BrandHeader` para siempre. Cambiar el nombre rompe todos los imports.

## Entregable

- `src/brand/resolver.ts` implementado con re-exports de los componentes del core.
- `src/brand/types/shell.ts` con interfaces de props si el core no las exporta.
- La app compila y funciona igual que antes.

## Criterio de hecho

`npm run build` pasa sin errores de TypeScript. Los tres exports (`BrandHeader`, `BrandFooter`, `BrandLogo`) son importables y tienen tipos correctos. El comportamiento visual es idéntico al baseline.
