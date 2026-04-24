# ACTION-025 — Ajustar vista de catálogo / búsqueda

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-024 completada. Tag `v4-landing-ready`. Landing corporativa operativa.

Esta acción inicia la Fase 5 — Refinamiento de vistas del marketplace. El objetivo de esta fase es que ninguna pantalla funcional tenga el aspecto original del core después de los tokens.

## Objetivo

Revisar la vista de catálogo/búsqueda de assets e identificar qué elementos no responden al sistema de tokens. Aplicar correcciones puntuales via CSS en `brand/tokens/base.css` sin tocar los CSS modules del core.

## Paso 1 — Auditar la vista de catálogo

```bash
# Localizar los componentes de la vista de búsqueda
find src/components -name "*.tsx" | xargs grep -l "search\|Search\|catalog\|Catalog\|asset\|Asset" | head -20
find src/components -name "*.module.css" | xargs grep -l "card\|Card\|grid\|Grid" | head -10
```

Navegar a `/search` en el navegador e identificar visualmente los elementos que todavía usan estilos del core sin adaptar:

- SearchBar / campo de búsqueda
- Filtros (sidebar o barra superior)
- Grid de resultados
- Cards de assets individuales
- Paginación
- Estados: loading, empty, error

Para cada elemento, abrir DevTools e inspeccionar:

- ¿Usa variables CSS (`var(--...)`)?
- ¿Tiene valores literales de color, radio o sombra?
- ¿El valor literal puede sobreescribirse con un selector más específico desde `base.css`?

## Paso 2 — Registrar excepciones en `docs/token-exceptions.md`

Abrir `docs/token-exceptions.md` (creado en ACTION-014) y completar/actualizar las entradas para los componentes de la vista de catálogo.

Formato de cada entrada:

````markdown
### SearchBar

**Archivo:** `src/components/Search/SearchBar.module.css`
**Propiedades con valores literales:**

- `border-radius: 24px` → debería ser `var(--radius-md)` (6px)
- `background: #f5f5f5` → debería ser `var(--color-bg-secondary)`
- `box-shadow: 0 2px 8px rgba(0,0,0,0.1)` → eliminar o `var(--shadow-sm)`

**Fix propuesto en base.css:**

```css
/* SearchBar override */
.searchBar input,
.searchBar [class*='input'] {
  border-radius: var(--radius-md) !important;
  background-color: var(--color-bg-secondary) !important;
  box-shadow: none !important;
}
```
````

**Severidad:** Alta (muy visible en la interfaz)

````

## Paso 3 — Aplicar correcciones en `brand/tokens/base.css`

Añadir una sección de overrides puntuales al final del archivo:

```css
/* ============================================================
   OVERRIDES PUNTUALES — componentes del core con valores hardcodeados
   Usar solo cuando el componente no responde a tokens CSS.
   Cada override debe estar comentado con el componente afectado.
   ============================================================ */

/* --- SearchBar --- */
/* Ajustar border-radius y fondo al sistema de diseño */
[class*="searchBar"] input,
[class*="SearchBar"] input {
  border-radius: var(--radius-md) !important;
  background-color: var(--color-bg-secondary) !important;
}

/* --- Asset Cards --- */
/* Eliminar sombras decorativas, usar borde */
[class*="assetCard"],
[class*="AssetCard"],
[class*="asset-card"] {
  box-shadow: none !important;
  border: var(--card-border) !important;
  border-radius: var(--card-radius) !important;
  transition: border-color var(--transition-base) !important;
}

[class*="assetCard"]:hover,
[class*="AssetCard"]:hover {
  border-color: var(--color-border-strong) !important;
  box-shadow: none !important;
}

/* --- Paginación --- */
[class*="pagination"] button,
[class*="Pagination"] button {
  border-radius: var(--radius-md) !important;
}
````

> **Nota sobre los selectores:** Los CSS Modules generan nombres de clase con hash (e.g. `assetCard__3xKs2`). Los selectores `[class*="assetCard"]` coinciden con cualquier clase que contenga ese string, incluyendo las hasheadas. Esta es la técnica correcta para sobreescribir CSS modules desde fuera sin modificarlos. Verificar los nombres reales de clase en DevTools antes de escribir los selectores.

## Paso 4 — Verificar el grid de resultados

El grid de cards debe ser responsive:

- 3 columnas en desktop (1280px)
- 2 columnas en tablet (768px)
- 1 columna en mobile (375px)

Si el grid del core no tiene este comportamiento, añadir override:

```css
/* Grid de resultados responsive */
[class*='assetGrid'],
[class*='AssetGrid'],
[class*='results'] {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: var(--space-6) !important;
}

@media (max-width: 1024px) {
  [class*='assetGrid'],
  [class*='AssetGrid'] {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 640px) {
  [class*='assetGrid'],
  [class*='AssetGrid'] {
    grid-template-columns: 1fr !important;
  }
}
```

## Paso 5 — Verificar estados especiales

- **Estado loading:** ¿Los skeletons usan colores del sistema? Si no, overridearlo.
- **Estado empty:** ¿El mensaje de "no hay resultados" usa los tokens de texto?
- **Estado error:** ¿El mensaje de error usa `var(--color-error)`?

## Paso 6 — Verificación visual

```bash
npm run dev
# Navegar a /search
```

Comparar con `docs/screenshots/baseline/` para la vista de catálogo.

Criterios visuales a verificar:

- [ ] SearchBar con radio y fondo del sistema de diseño
- [ ] Cards con borde (no sombra)
- [ ] Grid responsive correcto
- [ ] Tipografía coherente con el sistema
- [ ] Colores de texto y fondo correctos
- [ ] Paginación con radio del sistema

## Qué evitar

- No modificar archivos CSS modules del core. Solo `brand/tokens/base.css`.
- No usar `!important` más de lo necesario. Si un override requiere `!important` en más de 3 propiedades para el mismo componente, considerar si es mejor crear un componente wrapper en `brand/components/`.
- No cambiar la estructura del layout de búsqueda. Solo estilos.

## Entregable

- `docs/token-exceptions.md` actualizado con los componentes de la vista de catálogo.
- `src/brand/tokens/base.css` con los overrides puntuales aplicados.
- Vista de catálogo visualmente coherente con el sistema de diseño.

## Criterio de hecho

La vista de catálogo se ve corporativa. Cards con borde, grid responsive, SearchBar adaptada. `npm run build` sin errores.
