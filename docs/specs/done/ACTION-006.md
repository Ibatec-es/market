# ACTION-006 — Modificación 1: `_app.tsx` carga CSS de brand

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-005 completada. Resolver implementado. La app funciona igual que el baseline.

Esta es la primera de cuatro modificaciones al core del fork. Es la más pequeña posible: añadir una línea de import.

## Objetivo de esta acción

Modificar `src/pages/_app.tsx` para que importe `src/brand/tokens/base.css` después de los estilos globales del core. Esto habilita el sistema de override de tokens CSS mediante cascada, sin editar ningún archivo original del core.

## Localizar el archivo

```bash
cat src/pages/_app.tsx
```

Buscar la línea donde se importan los estilos globales. En el core de OceanProtocol suele ser:

```typescript
import '../stylesGlobal/styles.css'
```

Puede haber otros imports de CSS antes o después. El import de brand debe ir **después de todos los imports de CSS del core**.

## Modificación a realizar

```typescript
// src/pages/_app.tsx
// ANTES — solo los imports existentes del core
import '../stylesGlobal/styles.css'

// DESPUÉS — añadir esta línea inmediatamente después
import '../stylesGlobal/styles.css'
import '../brand/tokens/base.css' // Brand token overrides — DO NOT REMOVE
```

Añadir el comentario `// Brand token overrides — DO NOT REMOVE` para que sea visible en futuros merges con upstream.

## Si hay múltiples imports de CSS

El archivo puede tener imports como:

```typescript
import '../stylesGlobal/styles.css'
import 'react-toastify/dist/ReactToastify.css'
import 'some-other-library/styles.css'
```

En ese caso, el import de brand va **al final de todos los imports de CSS**, para que tenga la mayor especificidad en cascada:

```typescript
import '../stylesGlobal/styles.css'
import 'react-toastify/dist/ReactToastify.css'
import 'some-other-library/styles.css'
import '../brand/tokens/base.css' // Brand token overrides — DO NOT REMOVE
```

## Verificación

```bash
npm run dev
```

La app debe verse exactamente igual. `brand/tokens/base.css` está vacío, por lo que no hay ningún cambio visual.

Para confirmar que el archivo se carga, añadir temporalmente una variable CSS trivial en `base.css` y verificar que se aplica:

```css
/* src/brand/tokens/base.css — test temporal */
:root {
  --brand-test: 1;
}
```

En DevTools del navegador, verificar que `--brand-test` existe en `:root`. Luego eliminar esa línea de test.

## Documentar la modificación

Crear o actualizar `docs/fork-diff.md`:

```markdown
# Fork Diff — Modificaciones al core

Este archivo documenta todas las modificaciones sobre archivos del core del fork upstream.
Mantenerlo actualizado facilita futuros merges con `OceanProtocolEnterprise/market`.

---

## MOD-001 — `src/pages/_app.tsx`

**Tipo:** Adición de import  
**Línea añadida:** `import '../brand/tokens/base.css'`  
**Posición:** Después del último import de CSS del core  
**Motivo:** Habilitar override de tokens CSS de la capa brand mediante cascada  
**Riesgo de conflicto en merge:** Bajo. Si upstream añade imports de CSS nuevos, simplemente reordenar para que el import de brand siga siendo el último.  
**Acción en merge:** Verificar que `import '../brand/tokens/base.css'` sigue siendo el último import de CSS.
```

## Patrón a seguir

Una línea de import. Nada más. Si se necesita hacer algo más complejo en `_app.tsx` en el futuro (por ejemplo, cargar un tema dinámico por cliente), eso va en una acción posterior con su propia justificación.

## Qué evitar

- No mover el import al principio del archivo. Debe ser el último CSS para que la cascada funcione.
- No añadir lógica condicional en `_app.tsx` en esta acción. Solo el import.
- No modificar ninguna otra línea del archivo.

## Entregable

- `src/pages/_app.tsx` con la línea de import añadida.
- `docs/fork-diff.md` creado con la documentación de MOD-001.
- La app compila y se ve igual que el baseline.

## Criterio de hecho

`npm run dev` funciona. La variable `--brand-test` es visible en DevTools cuando se añade al `base.css`. `docs/fork-diff.md` documenta la modificación.
