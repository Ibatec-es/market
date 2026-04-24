# Fork Diff — Modificaciones al core de OceanProtocol Market

**Repositorio upstream:** `https://github.com/OceanProtocolEnterprise/market`  
**Repositorio fork:** `https://github.com/Ibatec-es/market`  
**Última sincronización con upstream:** [fecha de ACTION-002]  
**Modificaciones al core:** 5 archivos

---

## Resumen de modificaciones

| ID      | Archivo                                       | Tipo de cambio                      | Riesgo en merge |
| ------- | --------------------------------------------- | ----------------------------------- | --------------- |
| MOD-001 | `src/pages/_app.tsx`                          | Añadir import CSS                   | Bajo            |
| MOD-002 | `src/components/App/index.tsx`                | Cambiar imports Header/Footer       | Medio           |
| MOD-003 | `src/components/@shared/atoms/Logo/index.tsx` | Añadir props opcionales             | Bajo            |
| MOD-004 | `src/@context/MarketMetadata/index.tsx`       | Añadir lógica de merge de contenido | Medio           |
| MOD-005 | `src/pages/index.tsx`                         | Añadir condicional de brand landing | Medio           |

---

## Detalle de modificaciones

### MOD-001 — `src/pages/_app.tsx`

**Tipo:** Adición de imports  
**Líneas añadidas:**

```typescript
import '../brand/tokens/base.css' // Override de tokens brand
import '../brand/tokens/active-theme.css' // Tema del cliente activo (generado en build)
```

**Posición:** Después del último import de CSS del core  
**Riesgo:** Bajo. Solo hay conflicto si upstream añade imports de CSS en esa misma línea.  
**Resolución en merge:** Mantener los imports de brand al final. Aplicar cualquier otro cambio del upstream.

---

### MOD-002 — `src/components/App/index.tsx`

**Tipo:** Cambio de imports  
**Líneas modificadas:**

```typescript
// ANTES:
import Header from '../Header'
import Footer from '../Footer/Footer'

// DESPUÉS:
import {
  BrandHeader as Header,
  BrandFooter as Footer
} from '../../brand/resolver'
```

**Riesgo:** Medio. Si upstream modifica la estructura de App/index.tsx, el conflicto estará en las líneas de import.  
**Resolución en merge:** Aplicar cambios funcionales del upstream (props, lógica, estructura JSX). Mantener los imports del resolver para Header y Footer. Si upstream añade nuevos componentes de layout, importarlos directamente del core (no necesitan pasar por el resolver a menos que se quieran tematizar).

---

### MOD-003 — `src/components/@shared/atoms/Logo/index.tsx`

**Tipo:** Extensión de interfaz de props  
**Cambio:** Añadidas props opcionales `src`, `alt`, `width`, `height`  
**Riesgo:** Bajo. Las props nuevas son opcionales. Si upstream modifica Logo, revisar compatibilidad.  
**Resolución en merge:** Aplicar cambios del upstream. Añadir de nuevo las 4 props opcionales al final de la interfaz si han sido eliminadas. El bloque `if (src)` también debe estar presente.

---

### MOD-004 — `src/@context/MarketMetadata/index.tsx`

**Tipo:** Extensión de lógica de carga  
**Cambio:** `siteContent` se construye mergeando el base con el override del brand  
**Riesgo:** Medio. Si upstream cambia la estructura del contexto o el tipo de `siteContent`, hay que adaptar el merge.  
**Resolución en merge:**

1. Aplicar los cambios del upstream.
2. Verificar que `baseSiteContent` sigue siendo el import del `content/site.json` base.
3. Verificar que el `deepMerge` sigue siendo compatible con el nuevo tipo de `siteContent`.
4. Si el tipo ha cambiado, actualizar `src/brand/utils/deepMerge.ts` si es necesario.

---

### MOD-005 — `src/pages/index.tsx`

**Tipo:** Condicional de renderizado  
**Cambio:** Si `USE_BRAND_LANDING` es true, renderiza `BrandLanding` en lugar de `CoreHome`  
**Riesgo:** Medio. Si upstream modifica la página home, el conflicto será en el bloque `else`.  
**Resolución en merge:**

1. Aplicar cambios del upstream en el bloque `else` (renderizado del CoreHome).
2. Mantener el bloque `if (USE_BRAND_LANDING)` intacto.
3. Verificar que los imports necesarios siguen presentes.

---

## Archivos nuevos (no conflicto)

Los siguientes directorios son completamente nuevos y no existen en el upstream. No generan conflictos en merge:

```
src/brand/           — Capa de personalización
docs/                — Documentación del proyecto
public/brand/        — Assets estáticos de marca
.env.example         — Variables de entorno de ejemplo
```

---

## Protocolo de sincronización con upstream

Ejecutar este protocolo cuando se quiera incorporar nuevas versiones del upstream:

### 1. Preparación

```bash
# Asegurar que el working tree está limpio
git status
git stash  # si hay cambios no commiteados

# Fetch del upstream
git fetch upstream
git log HEAD..upstream/main --oneline  # ver qué commits hay nuevos
```

### 2. Identificar impacto

Antes de hacer el merge, ver qué archivos del core han cambiado en el upstream:

```bash
git diff HEAD..upstream/main --name-only | grep -E "src/pages/_app|src/components/App|Logo/index|MarketMetadata|pages/index"
```

Si alguno de los 5 archivos modificados aparece, hay que preparar la resolución manual del conflicto.

### 3. Merge

```bash
git merge upstream/main
```

Si hay conflictos, resolverlos siguiendo las instrucciones de cada MOD descritas arriba.

### 4. Verificación post-merge

```bash
npm install  # por si el upstream actualizó dependencias
npm run build
npm run dev
# Verificar que la app funciona y los 5 archivos siguen teniendo las modificaciones
```

Comprobar los 5 archivos:

```bash
grep "brand/tokens/base.css" src/pages/_app.tsx
grep "brand/resolver" src/components/App/index.tsx
grep "src?: string" src/components/@shared/atoms/Logo/index.tsx
grep "deepMerge" src/@context/MarketMetadata/index.tsx
grep "USE_BRAND_LANDING" src/pages/index.tsx
```

Si alguno de los grep no devuelve resultado, la modification se perdió en el merge y hay que reaplicarla.

### 5. Documentar el sync

Actualizar la fecha de "Última sincronización" en la cabecera de este documento.

```bash
git add .
git commit -m "chore: sync with upstream [fecha]"
```

---

## Notas sobre migraciones mayores

Si el upstream lanza una versión major (cambio de Next.js, cambio de arquitectura de componentes, etc.), el protocolo anterior puede no ser suficiente. En ese caso:

1. Crear una rama `upgrade/upstream-vX` para la migración.
2. Aplicar los cambios del upstream en esa rama.
3. Reaplicar las 5 modificaciones desde cero, leyendo cada MOD de este documento.
4. Verificar en la rama antes de merge a main.
5. Actualizar este documento si alguna modificación ha cambiado.
