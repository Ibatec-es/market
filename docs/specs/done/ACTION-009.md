# ACTION-009 — Modificación 4: `MarketMetadata` permite extensión de contenido

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-008 completada. Logo acepta resolución externa.

## Objetivo de esta acción

Modificar `src/@context/MarketMetadata/index.tsx` para que el objeto `siteContent` (cargado desde `content/site.json`) pueda mezclarse con contenido adicional de la capa brand (`brand/content/[BRAND_ID]/site.json`). Los campos del brand override ganan en conflicto. Si no existe archivo brand, el comportamiento es idéntico al original.

## Localizar y leer el archivo

```bash
cat src/@context/MarketMetadata/index.tsx
cat content/site.json
```

El contexto probablemente tiene una estructura similar a:

```typescript
import siteContent from '../../content/site.json'

const MarketMetadataContext = createContext<typeof siteContent>(siteContent)

export function MarketMetadataProvider({ children }: { children: ReactNode }) {
  return (
    <MarketMetadataContext.Provider value={siteContent}>
      {children}
    </MarketMetadataContext.Provider>
  )
}
```

## Implementación

### 1. Crear la función deepMerge

No añadir dependencias externas. Implementar una utilidad ligera en `src/brand/utils/deepMerge.ts`:

```typescript
// src/brand/utils/deepMerge.ts

/**
 * Merge superficial con un nivel de profundidad.
 * Suficiente para la estructura de site.json.
 * Los valores del `override` ganan en conflicto.
 */
export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Partial<T>
): T {
  const result = { ...base }

  for (const key in override) {
    const baseVal = base[key]
    const overrideVal = override[key]

    if (
      overrideVal !== null &&
      typeof overrideVal === 'object' &&
      !Array.isArray(overrideVal) &&
      typeof baseVal === 'object' &&
      baseVal !== null &&
      !Array.isArray(baseVal)
    ) {
      result[key] = {
        ...(baseVal as object),
        ...(overrideVal as object)
      } as T[typeof key]
    } else if (overrideVal !== undefined) {
      result[key] = overrideVal as T[typeof key]
    }
  }

  return result
}
```

> **Nota:** Si `site.json` tiene arrays (por ejemplo, `menu` como array de items), el merge de arrays reemplaza el array completo, no hace merge de items individuales. Esto es el comportamiento correcto: si el brand override define el menú, reemplaza el menú completo.

### 2. Crear el archivo de brand content vacío

Verificar que `src/brand/content/default/site.json` existe (creado en ACTION-004) y contiene `{}`.

### 3. Modificar el contexto

```typescript
// src/@context/MarketMetadata/index.tsx

import baseSiteContent from '../../content/site.json'
import { deepMerge } from '../../brand/utils/deepMerge'

// Intentar cargar el override del brand actual
// Next.js resuelve este import en build time según NEXT_PUBLIC_BRAND_ID
let brandSiteContent: Partial<typeof baseSiteContent> = {}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  brandSiteContent = require(`../../brand/content/${
    process.env.NEXT_PUBLIC_BRAND_ID || 'default'
  }/site.json`)
} catch {
  // No existe archivo brand para este BRAND_ID — usar base sin cambios
  brandSiteContent = {}
}

const siteContent = deepMerge(baseSiteContent, brandSiteContent)

// El resto del archivo igual que el original
const MarketMetadataContext = createContext<typeof baseSiteContent>(siteContent)

export function MarketMetadataProvider({ children }: { children: ReactNode }) {
  return (
    <MarketMetadataContext.Provider value={siteContent}>
      {children}
    </MarketMetadataContext.Provider>
  )
}
```

> **Advertencia sobre `require()` dinámico:** En Next.js, `require()` con template literal puede generar warnings o requerir configuración en `next.config.js`. Alternativa más segura si hay problemas: importar el JSON de forma estática en un archivo intermedio por brand y hacer el merge en ese punto.

### Alternativa estática si `require()` dinámico da problemas

```typescript
// src/brand/content/index.ts
import defaultContent from './default/site.json'

const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || 'default'

const brandContents: Record<string, unknown> = {
  default: defaultContent
  // Añadir aquí nuevos clientes: 'acme': acmeContent,
}

export const brandSiteContent = brandContents[BRAND_ID] ?? {}
```

Y en el contexto:

```typescript
import { brandSiteContent } from '../../brand/content'
const siteContent = deepMerge(baseSiteContent, brandSiteContent)
```

Esta alternativa es más verbosa al añadir clientes pero no tiene problemas con el bundler.

## Verificación

Con `src/brand/content/default/site.json` vacío (`{}`), el comportamiento debe ser idéntico al original.

Para probar el merge, añadir temporalmente un campo al JSON:

```json
// src/brand/content/default/site.json — test temporal
{
  "siteTitle": "Ibatec Market"
}
```

Verificar en la app que el título del site ha cambiado. Luego vaciar el JSON de nuevo.

## Documentar la modificación

Añadir a `docs/fork-diff.md`:

```markdown
## MOD-004 — `src/@context/MarketMetadata/index.tsx`

**Tipo:** Extensión de lógica de carga de contenido  
**Cambio:** `siteContent` se construye mergeando `content/site.json` con `brand/content/[BRAND_ID]/site.json`  
**Comportamiento sin archivo brand:** Idéntico al original  
**Comportamiento con archivo brand:** Los campos del brand override reemplazan los del base  
**Motivo:** Permitir personalización de textos, menú y footer por cliente sin editar el site.json base  
**Riesgo de conflicto en merge:** Medio. Si upstream cambia la estructura del contexto, adaptar la lógica de merge al nuevo patrón.  
**Acción en merge:** Mantener la lógica de deepMerge. Verificar que `baseSiteContent` sigue siendo el tipo correcto.
```

## Patrón a seguir

La modificación es aditiva: añade merge, no reemplaza la carga original. `baseSiteContent` sigue siendo la fuente de verdad. El brand content es solo un override.

## Qué evitar

- No cambiar el tipo del contexto. Sigue siendo `typeof baseSiteContent`.
- No hacer el merge en cada render. Hacerlo una vez al cargar el módulo (fuera del componente).
- No añadir lógica de negocio al contexto. Solo merge de datos de configuración.

## Entregable

- `src/brand/utils/deepMerge.ts` implementado.
- `src/@context/MarketMetadata/index.tsx` con la lógica de merge.
- `docs/fork-diff.md` actualizado con MOD-004.
- La app compila y funciona igual con el JSON brand vacío.

## Criterio de hecho

`npm run build` sin errores. Con `site.json` brand vacío, la app es idéntica al baseline. Con un campo sobreescrito, ese campo cambia en la app. El merge es no destructivo.
