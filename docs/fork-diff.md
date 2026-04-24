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

## MOD-002 — `src/components/App/index.tsx`

**Tipo:** Cambio de imports  
**Cambio:** `import Header from '../Header'` → `import { BrandHeader as Header } from '../../brand/resolver'`  
**Cambio:** `import Footer from '../Footer/Footer'` → `import { BrandFooter as Footer } from '../../brand/resolver'`  
**Motivo:** Desacoplar el shell del core. Permite sustituir Header y Footer desde la capa brand sin modificar este archivo de nuevo.  
**Riesgo de conflicto en merge:** Medio. Si upstream modifica `App/index.tsx`, el conflicto será en las líneas de import. Resolver manteniendo los imports del resolver y aplicando cualquier otro cambio del upstream.  
**Acción en merge:** Mantener los dos imports del resolver. Aplicar cualquier cambio funcional del upstream que no sean los imports de Header/Footer.

## MOD-003 — `src/components/@shared/atoms/Logo/index.tsx`

**Tipo:** Extensión de interfaz de props  
**Cambio:** Añadidas props opcionales `src`, `alt`, `width`, `height`  
**Comportamiento sin las nuevas props:** Idéntico al original  
**Comportamiento con `src`:** Renderiza imagen externa en lugar del SVG fijo  
**Motivo:** Habilitar resolución de logo por cliente desde la capa brand  
**Riesgo de conflicto en merge:** Bajo. Si upstream modifica Logo, revisar que las props nuevas siguen siendo compatibles con la nueva implementación.  
**Acción en merge:** Aplicar cambios del upstream y añadir de nuevo las props opcionales si se han eliminado.

## MOD-004 — `src/@context/MarketMetadata/index.tsx`

**Tipo:** Extensión de lógica de carga de contenido  
**Cambio:** `siteContent` se construye mergeando `content/site.json` con `brand/content/[BRAND_ID]/site.json`  
**Comportamiento sin archivo brand:** Idéntico al original  
**Comportamiento con archivo brand:** Los campos del brand override reemplazan los del base  
**Motivo:** Permitir personalización de textos, menú y footer por cliente sin editar el site.json base  
**Riesgo de conflicto en merge:** Medio. Si upstream cambia la estructura del contexto, adaptar la lógica de merge al nuevo patrón.  
**Acción en merge:** Mantener la lógica de deepMerge. Verificar que `baseSiteContent` sigue siendo el tipo correcto.

## MOD-005 — `src/pages/index.tsx`

**Tipo:** Condicional de renderizado  
**Cambio:** Si `NEXT_PUBLIC_BRAND_ID` está activo, renderiza `brand/components/Landing` en lugar del `Home` del core  
**Comportamiento sin brand:** El `Home` del core renderiza normalmente  
**Comportamiento con brand:** La landing corporativa reemplaza la home  
**Motivo:** Separar la landing de marca de la implementación demo del core  
**Riesgo de conflicto en merge:** Medio. Si upstream modifica `pages/index.tsx`, revisar que el condicional sigue aplicándose correctamente sobre la nueva implementación del core.  
**Acción en merge:** Mantener el bloque condicional. Aplicar cambios del upstream en el bloque `else` (fallback al core).
