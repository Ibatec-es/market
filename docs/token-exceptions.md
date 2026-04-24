# Excepciones de tokens — valores hardcodeados en componentes del core

Estos componentes tienen valores CSS literales que no responden al sistema de tokens.
Se abordarán en la Fase 5 (Refinamiento) con fixes puntuales de CSS en `brand/tokens/`.

| Componente       | Archivo                                                        | Propiedad       | Valor hardcodeado                   | Severidad |
| ---------------- | -------------------------------------------------------------- | --------------- | ----------------------------------- | --------- |
| Header/SearchBar | `components/Header/SearchBar.module.css`                       | `background`    | `#fdd655`                           | Media     |
| Header/Menu      | `components/Header/Menu.module.css`                            | `color`         | `#0a4b70`                           | Alta      |
| Header/Wallet    | `components/Header/Wallet/Details.module.css`                  | `color`         | `#0a4b70`                           | Alta      |
| Header/Menu      | `components/Header/Menu.module.css`                            | `box-shadow`    | `1px 2px 8px var(--black-alpha-15)` | Baja      |
| ComputeWizard    | `components/ComputeWizard/UserParametersStep/index.module.css` | `box-shadow`    | `var(--shadow-md)`                  | Baja      |
| Header/Menu      | `components/Header/Menu.module.css`                            | `border-radius` | `50px`                              | Media     |
| ComputeWizard    | `components/ComputeWizard/Review/index.module.css`             | `border-radius` | `12px`                              | Baja      |
| ComputeWizard    | `components/ComputeWizard/SelectPrimaryAsset/index.module.css` | `border-radius` | `0.75rem`                           | Baja      |

> **Nota:** Existen cientos de ocurrencias de colores, sombras y radios hardcodeados (más de 400 colores, 240 sombras y 360 border-radius) en los módulos CSS. La tabla anterior solo muestra algunos ejemplos representativos de los componentes afectados.

## Estrategia de resolución

Para cada excepción, la solución en Fase 5 es sobreescribir el selector específico
en `brand/tokens/base.css` o archivos de override dedicados, sin tocar el CSS module del core:

```css
/* Override puntual para SearchBar */
.searchBar {
  background: var(--brand-primary) !important;
  border-radius: var(--radius-md) !important;
}
```

Usar `!important` solo cuando sea el único mecanismo disponible (CSS modules tienen
alta especificidad y no siempre se pueden sobreescribir sin él).

---

## Excepciones resueltas — Fase 5 / ACTION-025 (Vista de catálogo)

### AssetTeaser

**Archivo:** `src/components/@shared/AssetTeaser/index.module.css`

| Propiedad                | Valor hardcodeado                     | Fix aplicado                                                          |
| ------------------------ | ------------------------------------- | --------------------------------------------------------------------- |
| `border-radius`          | `20px`                                | `var(--card-radius)` via selector `[class*='teaser'] [class*='link']` |
| `box-shadow`             | `1px 4px 8px 0 var(--black-alpha-15)` | `none`                                                                |
| `.title` color           | `#303031`                             | `var(--font-color-heading)`                                           |
| `.title` font-size       | `18px`                                | `var(--font-size-base)`                                               |
| `.content p` font-family | implícita del core                    | `var(--font-family-base)`                                             |
| `.link` border hover     | `#e0e0e0`                             | `var(--border-color)`                                                 |

**Severidad:** Alta — elemento más visible de la vista de catálogo  
**Estado:** ✅ Resuelto en `base.css`

---

### SearchSection (barra de búsqueda)

**Archivo:** `src/components/@shared/SearchSection/index.module.css`

| Propiedad                       | Valor hardcodeado                     | Fix aplicado                |
| ------------------------------- | ------------------------------------- | --------------------------- |
| `background` del contenedor     | `#fff`                                | `var(--background-content)` |
| `box-shadow` del contenedor     | `1px 4px 8px 0 var(--black-alpha-15)` | `none` + borde              |
| `font-family` input/placeholder | `'Helvetica'`                         | `var(--font-family-base)`   |
| `background` botón búsqueda     | `#fdd655`                             | `var(--color-primary)`      |
| `color` texto botón             | `#0a4b70`                             | `var(--brand-white)`        |
| `fill` icono búsqueda           | `#0a4b70`                             | `var(--brand-white)`        |

**Severidad:** Alta — primer elemento interactivo del catálogo  
**Estado:** ✅ Resuelto en `base.css`

---

### Search Filter / sidebar

**Archivo:** `src/components/Search/Filter.module.css`

| Propiedad                       | Valor                                    | Fix aplicado                  |
| ------------------------------- | ---------------------------------------- | ----------------------------- |
| `filterTypeLabel` font-weight   | `700` literal                            | `var(--font-weight-semibold)` |
| `filterTypeLabel` color         | `var(--clr-slate-70)` (core)             | `var(--font-color-text)`      |
| Bordes separadores              | `1px solid var(--border-color)` del core | color alineado con brand      |
| `compactFilterContainer` radius | `var(--border-radius)` del core          | `var(--radius-md)`            |

**Severidad:** Media — visible pero menos impactante que las cards  
**Estado:** ✅ Resuelto en `base.css`

---

## Excepciones resueltas — Fase 5 / ACTION-026 (Vista de detalle de asset)

### AssetContent (contenedor principal)

**Archivo:** `src/components/Asset/AssetContent/index.module.css`

| Propiedad            | Valor hardcodeado                     | Fix aplicado                |
| -------------------- | ------------------------------------- | --------------------------- |
| `border-radius`      | `20px`, `10px`, `8px`                 | `var(--card-radius)`        |
| `box-shadow`         | `1px 4px 8px 0 var(--black-alpha-15)` | `none`                      |
| `background`         | `#fff`                                | `var(--background-content)` |
| `color` títulos      | `#303031`                             | `var(--font-color-heading)` |
| `color` secundario   | `#757575`                             | `var(--font-color-text)`    |
| `border` service tag | `1px solid #00adb2`                   | `var(--color-primary)`      |

**Severidad:** Alta **Estado:** ✅ Resuelto

---

### AssetInteractionPanel / AssetActions

**Archivo:** `src/components/Asset/AssetActions/AssetInteractionPanel/index.module.css` `src/components/Asset/AssetActions/index.module.css`

| Propiedad       | Valor hardcodeado                     | Fix aplicado                |
| --------------- | ------------------------------------- | --------------------------- |
| `border-radius` | `20px`                                | `var(--card-radius)`        |
| `box-shadow`    | `1px 4px 8px 0 var(--black-alpha-15)` | `none`                      |
| `background`    | `#fff`                                | `var(--background-content)` |

**Severidad:** Alta **Estado:** ✅ Resuelto

---

### ButtonBuy

**Archivo:** `src/components/Asset/AssetActions/ButtonBuy/index.module.css`

| Propiedad       | Valor hardcodeado                     | Fix aplicado       |
| --------------- | ------------------------------------- | ------------------ |
| `border-radius` | `var(--radius-xl)` (muy redondeado)   | `var(--radius-md)` |
| `box-shadow`    | `1px 2px 8px 0 var(--black-alpha-15)` | `none`             |

**Severidad:** Alta — CTA principal del detalle **Estado:** ✅ Resuelto

---

### ServiceCard

**Archivo:** `src/components/Asset/AssetContent/ServiceCard.module.css`

| Propiedad         | Valor hardcodeado       | Fix aplicado                |
| ----------------- | ----------------------- | --------------------------- |
| `border-radius`   | `20px`                  | `var(--card-radius)`        |
| `background`      | `#fff`                  | `var(--background-content)` |
| Gradiente botón   | `#fdd655`               | `var(--color-primary)`      |
| Color texto botón | `#0a4b70`               | `var(--brand-white)`        |
| Tag de servicio   | `color/border: #00adb2` | `var(--color-primary)`      |

**Severidad:** Alta **Estado:** ✅ Resuelto

---

### StatusTag

**Archivo:** `src/components/@shared/atoms/StatusTag/index.module.css`

| Propiedad             | Valor hardcodeado                     | Fix aplicado       |
| --------------------- | ------------------------------------- | ------------------ |
| `border-radius`       | `20px` (pills)                        | `var(--radius-sm)` |
| `box-shadow`          | `1px 2px 8px 0 var(--black-alpha-15)` | `none`             |
| `border/color` status | `#00adb2`, `#8b5cf6`                  | tokens del sistema |

**Severidad:** Media **Estado:** ✅ Resuelto

---

### AssetTags / MetaItem / MetaFull

| Componente  | Propiedad     | Valor hardcodeado          | Fix                           |
| ----------- | ------------- | -------------------------- | ----------------------------- |
| AssetTags   | `color` tag   | `#4ca3d3`, `#303031`       | `var(--color-primary)`        |
| MetaItem    | `color` valor | `#303031`                  | `var(--font-color-text)`      |
| MetaFull    | `color` texto | `#303031`                  | `var(--font-color-heading)`   |
| Código/hash | `background`  | `#1f2937` (hardcoded dark) | `var(--background-highlight)` |

**Estado:** ✅ Resuelto

---

## Excepciones resueltas — Fase 5 / ACTION-027 (Formularios y publicación)

### Inputs, Textareas y Selects

**Archivo:** Varios (`src/components/@shared/FormInput/`)

| Propiedad              | Fix aplicado en `base.css`              |
| ---------------------- | --------------------------------------- |
| `border-radius`        | `var(--radius-md)` globalmente          |
| `background-color`     | `var(--background-content)` para inputs |
| `border`               | `1px solid var(--color-border)`         |
| `outline` (focus)      | `2px solid var(--color-primary)`        |
| `border-color` (error) | `var(--brand-error-red)`                |

**Accesibilidad:** Los labels se mantienen visibles y los estados de foco tienen un offset visible para mejor accesibilidad de navegación por teclado.

**Estado:** ✅ Resuelto

---

## Excepciones resueltas — Fase 5 / ACTION-028 (Vistas secundarias)

### Perfil de usuario, Historial, Modales y Markdown

**Archivos afectados:** Páginas como `/profile`, `/history`, páginas de contenido (`/privacy`, `/terms`), modales y notificaciones.

| Vista / Componente      | Fix aplicado en `base.css`                                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Avatar                  | `border-radius: var(--radius-full)` (completamente circular) con borde del color `--border-color`.                                                 |
| Profile Tabs            | `color` para estados normal y activo utilizando los tokens, y borde inferior interactivo azul.                                                     |
| User Assets             | Aplicación de `var(--card-border)` y `var(--card-radius)` a las tablas de recursos.                                                                |
| History (Transacciones) | `border-radius: var(--card-radius)`, y hashes renderizados con tipografía monospace.                                                               |
| Status Badges           | Estados (success, pending, error) utilizan mixins de color (transparencias 15%) sobre el color base respectivo.                                    |
| Markdown / Prose        | Sobreescritura total de la tipografía (textos, cabeceras, links y códigos `inline`) respetando anchos de línea óptimos y los tokens de texto.      |
| Modales & Toasts        | Radio del borde actualizado a `var(--card-radius)` o `var(--radius-md)`. Overlay de fondo de modal difuminado usando `backdrop-filter: blur(4px)`. |

**Componentes resistentes documentados:**

- **Ninguno hasta la fecha**. Todos los estilos hardcodeados se han podido resolver exitosamente utilizando selectores de atributos en `base.css` y la declaración `!important`.

**Estado:** ✅ Resuelto
