# ACTION-007 — Modificación 2: `App/index.tsx` consume el resolver

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-006 completada. `_app.tsx` carga `brand/tokens/base.css`. `docs/fork-diff.md` existe.

## Objetivo de esta acción

Modificar `src/components/App/index.tsx` para que importe `Header` y `Footer` desde `src/brand/resolver` en lugar de hacerlo directamente desde sus carpetas en el core. Esto desacopla el shell del core y activa la arquitectura de extensión para estos dos componentes.

## Localizar y leer el archivo

```bash
cat src/components/App/index.tsx
```

Identificar estas líneas (los paths exactos pueden variar):

```typescript
import Header from '../Header'
import Footer from '../Footer/Footer'
// o variantes como:
import Header from '../Header/index'
import { Footer } from '../Footer'
```

Leer el archivo completo para entender qué props se pasan a Header y Footer. Esas props deben seguir pasándose igual después de la modificación.

## Modificación a realizar

Sustituir los imports directos de Header y Footer por imports desde el resolver:

```typescript
// ANTES
import Header from '../Header'
import Footer from '../Footer/Footer'

// DESPUÉS
import {
  BrandHeader as Header,
  BrandFooter as Footer
} from '../../brand/resolver'
// Brand shell resolution — DO NOT revert to direct imports
```

El alias `as Header` y `as Footer` es intencional: mantiene el nombre de variable que el resto del componente ya usa, minimizando el diff.

Verificar que el path relativo `../../brand/resolver` es correcto desde `src/components/App/index.tsx`. Si la estructura de carpetas es diferente, ajustar.

## Verificar compatibilidad de props

Después de cambiar los imports, TypeScript puede advertir de incompatibilidades si los tipos del resolver no coinciden exactamente con lo que `App/index.tsx` espera.

Revisar cómo se usan Header y Footer en el JSX del archivo:

```typescript
// Ejemplo típico
<Header />
// o
<Header siteContent={siteContent} />
// o
<Footer links={footerLinks} />
```

Si hay advertencias de tipos, actualizar `src/brand/types/shell.ts` (creado en ACTION-005) para que las interfaces sean compatibles. No cambiar cómo se llaman los componentes en el JSX.

## Verificación

```bash
npm run dev
```

La app debe verse exactamente igual. Header y Footer renderizan los mismos componentes del core — solo ha cambiado la ruta del import.

```bash
npm run build
# Sin errores de TypeScript
```

## Documentar la modificación

Añadir a `docs/fork-diff.md`:

```markdown
## MOD-002 — `src/components/App/index.tsx`

**Tipo:** Cambio de imports  
**Cambio:** `import Header from '../Header'` → `import { BrandHeader as Header } from '../../brand/resolver'`  
**Cambio:** `import Footer from '../Footer/Footer'` → `import { BrandFooter as Footer } from '../../brand/resolver'`  
**Motivo:** Desacoplar el shell del core. Permite sustituir Header y Footer desde la capa brand sin modificar este archivo de nuevo.  
**Riesgo de conflicto en merge:** Medio. Si upstream modifica `App/index.tsx`, el conflicto será en las líneas de import. Resolver manteniendo los imports del resolver y aplicando cualquier otro cambio del upstream.  
**Acción en merge:** Mantener los dos imports del resolver. Aplicar cualquier cambio funcional del upstream que no sean los imports de Header/Footer.
```

## Patrón a seguir

El resto del archivo `App/index.tsx` no cambia. Ni una línea más. Si se detecta algo que "podría mejorarse" en el archivo, no es el momento — se anota como deuda técnica y se aborda en otra acción.

## Qué evitar

- No cambiar cómo se usan `Header` y `Footer` en el JSX. Solo los imports.
- No mover lógica del archivo a otros sitios.
- No añadir props nuevas a Header o Footer en este momento.
- No cambiar el nombre de las variables locales (`Header`, `Footer`) dentro del archivo. El alias en el import mantiene los nombres originales para no generar diff innecesario.

## Entregable

- `src/components/App/index.tsx` con los imports cambiados al resolver.
- `docs/fork-diff.md` actualizado con MOD-002.
- La app compila y se ve igual que el baseline.

## Criterio de hecho

`npm run build` pasa sin errores. Header y Footer se renderizan correctamente en todas las rutas. El diff de `App/index.tsx` muestra exactamente 2 líneas cambiadas (los dos imports).
