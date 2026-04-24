# ACTION-012 — Configurar tipografía corporativa

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-011 completada. Paleta de colores corporativa aplicada.

## Objetivo de esta acción

Sustituir las fuentes tipográficas del core por las fuentes corporativas. El cambio se aplica mediante tokens CSS en `brand/tokens/base.css` y carga de fuentes en `_document.tsx` o `_app.tsx`. Sin tocar ningún componente.

## Paso 1 — Auditar la tipografía actual del core

```bash
cat src/stylesGlobal/_variables.css | grep -i font
grep -r "font-family" src/stylesGlobal/ --include="*.css"
grep -r "font-family" src/components/ --include="*.css" -h | sort -u
```

Identificar:

- Las variables CSS de fuente (`--font-primary`, `--font-mono`, etc.)
- Qué fuentes usa el core actualmente
- Dónde se cargan esas fuentes (Google Fonts en `_document.tsx`, `@import` en CSS, etc.)

## Paso 2 — Elección de fuentes corporativas

### Recomendación para marketplace B2B profesional

| Rol                             | Fuente           | Por qué                                                          |
| ------------------------------- | ---------------- | ---------------------------------------------------------------- |
| Display / Títulos               | `DM Sans`        | Moderna, geométrica, legible, no genérica                        |
| Cuerpo                          | `Inter`          | Excepción justificada: máxima legibilidad en interfaces de datos |
| Monospace (hashes, IDs, código) | `JetBrains Mono` | Reconocible, técnica, diferencia claramente el contenido técnico |

Alternativas si se quiere más carácter:

- Display: `Plus Jakarta Sans`, `Outfit`, `Sora`
- Cuerpo: `Figtree`, `Nunito Sans`

**La elección final la decide el responsable de diseño del proyecto.** Este documento documenta la implementación, no la elección.

## Paso 3 — Cargar las fuentes

### Opción A — Google Fonts en `_document.tsx` (recomendada)

```bash
# Verificar si existe _document.tsx
cat src/pages/_document.tsx
```

Si existe, añadir el link de Google Fonts en el `<Head>`:

```typescript
// src/pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Brand fonts — DO NOT REMOVE */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

Si no existe `_document.tsx`, crearlo con este contenido. Es un archivo estándar de Next.js, no una modificación al core.

### Opción B — Self-hosted (para entornos sin acceso a Google Fonts)

Descargar las fuentes con `fontsource`:

```bash
npm install @fontsource/dm-sans @fontsource/inter @fontsource/jetbrains-mono
```

Importar en `_app.tsx` después del import de brand tokens:

```typescript
// src/pages/_app.tsx
import '@fontsource/dm-sans/300.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/600.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
```

## Paso 4 — Aplicar las fuentes con tokens

En `src/brand/tokens/base.css`, añadir después de los tokens de color:

```css
/* ============================================================
   TIPOGRAFÍA
   ============================================================ */
:root {
  /* Familias */
  --font-display: 'DM Sans', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Escala — base 16px, ratio 1.25 */
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.25rem; /* 36px */

  /* Pesos */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

Verificar que las variables `--font-display`, `--font-body`, `--font-mono` sobreescriben los nombres exactos que usa el core. Ajustar si es necesario.

## Paso 5 — Aplicar fuente base en el body

Si el core no aplica la fuente de cuerpo en `:root` o `body`, añadir en `base.css`:

```css
body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-display);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
}

code,
pre,
kbd {
  font-family: var(--font-mono);
}
```

## Paso 6 — Verificación

```bash
npm run dev
```

En DevTools:

- Verificar que los títulos usan `DM Sans`.
- Verificar que el cuerpo de texto usa `Inter`.
- Verificar que los hashes o IDs de assets usan `JetBrains Mono`.
- Verificar en la pestaña Network que las fuentes se cargan (status 200).

Comprobar que `npm run build` no genera errores.

## Qué evitar

- No usar `font-family` con valores literales en ningún componente brand. Solo tokens.
- No cargar variantes de peso que no se usen (impacta en performance).
- No modificar los archivos CSS del core para aplicar la nueva fuente — solo `base.css` y `_document.tsx`.

## Entregable

- `src/brand/tokens/base.css` actualizado con tokens tipográficos.
- `src/pages/_document.tsx` con las fuentes cargadas.
- La app muestra las fuentes corporativas.

## Criterio de hecho

Las fuentes corporativas se renderizan en toda la app. `npm run build` sin errores. No hay fuente del core que aparezca en ninguna pantalla.
