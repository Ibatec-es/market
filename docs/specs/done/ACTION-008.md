# ACTION-008 — Modificación 3: Logo acepta resolución externa

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-007 completada. App/index.tsx consume el resolver.

## Objetivo de esta acción

Modificar el componente `Logo` del core para que acepte una prop `src` opcional. Si se pasa `src`, renderiza esa imagen. Si no, usa el comportamiento original (import directo de `@images/logo.svg`). Esto mantiene compatibilidad total hacia atrás mientras habilita la resolución de logo por cliente.

## Localizar el archivo

```bash
cat src/components/@shared/atoms/Logo/index.tsx
```

El componente actual probablemente importa el SVG directamente:

```typescript
import LogoAsset from '../../../../@images/logo.svg'
// o
import LogoAsset from '@images/logo.svg'
```

Y lo renderiza de forma fija:

```typescript
export default function Logo({ className }: { className?: string }) {
  return <LogoAsset className={className} />
}
```

## Modificación a realizar

Añadir prop `src` opcional que, si está presente, usa `next/image` o un `<img>` nativo para renderizar el logo externo. Si no está presente, usa el SVG del core como hasta ahora.

```typescript
// src/components/@shared/atoms/Logo/index.tsx

import LogoAsset from '@images/logo.svg' // import original — mantener

interface LogoProps {
  className?: string
  src?: string // prop nueva — logo externo por URL o path
  alt?: string // prop nueva — texto alternativo
  width?: number // prop nueva — para next/image
  height?: number // prop nueva — para next/image
}

export default function Logo({
  className,
  src,
  alt = 'Logo',
  width = 120,
  height = 32
}: LogoProps) {
  if (src) {
    // Resolución externa — usa el logo de la capa brand
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    )
  }

  // Comportamiento original — sin cambios
  return <LogoAsset className={className} />
}
```

> **Nota:** Si el proyecto usa `next/image` en otros componentes, es preferible usarlo aquí también para coherencia. Verificar si `next/image` está en uso antes de decidir.

## Actualizar el resolver

En `src/brand/resolver.ts`, el export de `BrandLogo` ahora puede recibir la prop `src` apuntando al asset de la capa brand. Actualizar el resolver para que el Logo corporativo se exporte con la fuente resuelta:

```typescript
// src/brand/resolver.ts

// Opción A: re-exportar el componente y pasar src donde se use
export { default as BrandLogo } from '../components/@shared/atoms/Logo'

// Opción B: crear un wrapper en brand/components/Logo/ que pre-configure src
// (esto se hace en ACTION-017)
```

Por ahora queda como Opción A. El wrapper completo va en ACTION-017.

## Verificar compatibilidad hacia atrás

Todos los lugares del codebase que usan `<Logo />` o `<Logo className="..."/>` deben seguir funcionando sin cambios. La prop `src` es opcional con valor `undefined` por defecto, lo que dispara el comportamiento original.

```bash
grep -r "<Logo" src/ --include="*.tsx"
```

Verificar que ningún uso existente pasa una prop `src`. Si alguno lo hace (poco probable), revisar ese caso específico.

## Verificación

```bash
npm run dev
```

El logo se renderiza igual en todas las páginas. No hay cambio visual.

Prueba manual de la prop `src`:

```typescript
// En cualquier componente, de forma temporal
<Logo src="/brand/assets/default/logo.svg" alt="Test" />
```

Debe renderizar el SVG placeholder creado en ACTION-004. Revertir el cambio temporal después de verificar.

## Documentar la modificación

Añadir a `docs/fork-diff.md`:

```markdown
## MOD-003 — `src/components/@shared/atoms/Logo/index.tsx`

**Tipo:** Extensión de interfaz de props  
**Cambio:** Añadidas props opcionales `src`, `alt`, `width`, `height`  
**Comportamiento sin las nuevas props:** Idéntico al original  
**Comportamiento con `src`:** Renderiza imagen externa en lugar del SVG fijo  
**Motivo:** Habilitar resolución de logo por cliente desde la capa brand  
**Riesgo de conflicto en merge:** Bajo. Si upstream modifica Logo, revisar que las props nuevas siguen siendo compatibles con la nueva implementación.  
**Acción en merge:** Aplicar cambios del upstream y añadir de nuevo las props opcionales si se han eliminado.
```

## Patrón a seguir

Modificación aditiva pura. Solo se añaden props opcionales. Nada se elimina ni se cambia en el flujo existente. Este es el patrón correcto para todas las modificaciones al core.

## Qué evitar

- No cambiar el tipo del import de `LogoAsset`. Sigue siendo el SVG del core.
- No eliminar el path de fallback (el `return <LogoAsset ... />`). Es el comportamiento default.
- No usar `require()` dinámico para cargar el logo. Los paths dinámicos con `require` tienen problemas con el bundler de Next.js.

## Entregable

- `src/components/@shared/atoms/Logo/index.tsx` con las props nuevas.
- `docs/fork-diff.md` actualizado con MOD-003.
- La app compila y el logo se renderiza igual que antes.

## Criterio de hecho

`npm run build` sin errores. El logo se ve igual en todas las páginas. Pasar `src` a `<Logo>` renderiza la imagen indicada. Todos los usos existentes de `<Logo>` sin `src` siguen funcionando.
