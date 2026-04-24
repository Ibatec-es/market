# ACTION-029 — Crear estructura de segundo cliente de ejemplo

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-028 completada. Todas las vistas del marketplace son coherentes.

Esta acción inicia la Fase 6 — Multi-cliente y documentación.

## Objetivo

Crear un segundo `BRAND_ID` de ejemplo (`demo-client`) para validar que el sistema multi-cliente funciona end-to-end. Si cambiar una variable de entorno transforma por completo la identidad visual de la app, el sistema está bien construido.

## Paso 1 — Crear la estructura del segundo cliente

```bash
# Tokens
mkdir -p src/brand/tokens/demo-client

# Assets
mkdir -p src/brand/assets/demo-client
mkdir -p public/brand/assets/demo-clienta

# Contenido
mkdir -p src/brand/content/demo-client
```

## Paso 2 — Crear el tema del segundo cliente

El segundo cliente debe tener una identidad visual claramente diferente para que el test sea obvio. Usar una paleta distinta — por ejemplo, un tema verde oscuro profesional en lugar del azul corporativo.

```css
/* src/brand/tokens/demo-client/theme.css */

/*
  Demo Client — Tema de ejemplo
  Verde oscuro + blanco roto
  Para validar que el sistema multi-cliente funciona
*/

:root {
  /* Primitivos específicos de este cliente */
  --primitive-green-800: #166534;
  --primitive-green-600: #16a34a;
  --primitive-green-100: #dcfce7;
  --primitive-green-50: #f0fdf4;
  --primitive-slate-warm-50: #fafaf9;

  /* Semánticos sobreescritos */
  --color-bg-primary: var(--primitive-slate-warm-50);
  --color-action-primary: var(--primitive-green-600);
  --color-action-primary-hover: var(--primitive-green-800);
  --color-action-primary-bg: var(--primitive-green-50);
}
```

## Paso 3 — Crear el logo del segundo cliente

Crear un SVG placeholder diferente para distinguirlo visualmente:

```svg
<!-- src/brand/assets/demo-client/logo.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="32" viewBox="0 0 140 32">
  <rect width="30" height="30" rx="6" fill="#16a34a" y="1"/>
  <text x="20" y="21" font-family="sans-serif" font-size="11" fill="white" text-anchor="middle" font-weight="bold">DC</text>
  <text x="90" y="21" font-family="sans-serif" font-size="13" fill="#166534" text-anchor="middle" font-weight="600">Demo Client</text>
</svg>
```

```bash
cp src/brand/assets/demo-client/logo.svg public/brand/assets/demo-client/logo.svg
```

## Paso 4 — Crear el `site.json` del segundo cliente

```json
// src/brand/content/demo-client/site.json
{
  "siteTitle": "Demo Client Market",
  "siteTagline": "Marketplace de datos para Demo Corp",
  "menu": [
    { "label": "Explorar", "href": "/search" },
    { "label": "Publicar", "href": "/publish" },
    { "label": "Acerca de", "href": "/about" }
  ],
  "footer": {
    "tagline": "Soluciones de datos para empresas innovadoras",
    "social": {
      "linkedin": "https://linkedin.com/company/demo-client"
    },
    "columns": [
      {
        "title": "Plataforma",
        "links": [
          { "label": "Catálogo", "href": "/search" },
          { "label": "Publicar dataset", "href": "/publish" }
        ]
      },
      {
        "title": "Legal",
        "links": [
          { "label": "Privacidad", "href": "/privacy" },
          { "label": "Términos", "href": "/terms" }
        ]
      }
    ],
    "copyright": "© 2026 Demo Client Corp. Todos los derechos reservados."
  }
}
```

## Paso 5 — Crear el `landing.json` del segundo cliente

```json
// src/brand/content/demo-client/landing.json
{
  "hero": {
    "badge": "Demo Client — Marketplace de datos",
    "headline": "Tu plataforma de datos empresariales",
    "subheadline": "Accede a datasets de calidad para impulsar tus decisiones de negocio.",
    "ctaPrimary": {
      "label": "Ver catálogo",
      "href": "/search"
    }
  },
  "valueProps": {
    "title": "Por qué Demo Client Market",
    "items": [
      {
        "id": "quality",
        "icon": "✅",
        "title": "Datos verificados",
        "description": "Cada dataset pasa por un proceso de validación antes de estar disponible."
      },
      {
        "id": "speed",
        "icon": "⚡",
        "title": "Acceso inmediato",
        "description": "Compra y descarga en segundos. Sin procesos de aprobación manuales."
      },
      {
        "id": "support",
        "icon": "🤝",
        "title": "Soporte dedicado",
        "description": "Equipo especializado disponible para ayudarte a encontrar los datos correctos."
      }
    ]
  },
  "process": {
    "title": "Tres pasos para empezar",
    "steps": [
      {
        "number": 1,
        "title": "Regístrate",
        "description": "Crea tu cuenta en menos de dos minutos."
      },
      {
        "number": 2,
        "title": "Explora",
        "description": "Navega el catálogo y filtra por tu sector."
      },
      {
        "number": 3,
        "title": "Descarga",
        "description": "Accede a los datos en el formato que necesitas."
      }
    ]
  },
  "cta": {
    "headline": "Empieza a tomar mejores decisiones",
    "cta": { "label": "Explorar datasets", "href": "/search" }
  }
}
```

## Paso 6 — Registrar el logo en el mapa del resolver de Logo

```typescript
// src/brand/components/Logo/index.tsx — actualizar LOGO_MAP

const LOGO_MAP: Record<string, string> = {
  default: '/brand/assets/default/logo.svg',
  'demo-client': '/brand/assets/demo-client/logo.svg' // ← añadir
}
```

## Paso 7 — Cargar el tema en `_app.tsx`

Para que los tokens del segundo cliente se carguen cuando `BRAND_ID=demo-client`, necesitamos una estrategia de carga dinámica del tema. Actualizar la importación en `_app.tsx`:

**Opción A — Variables de entorno en build time (recomendada para MVP):**

En lugar de un solo `import '../brand/tokens/base.css'`, crear un archivo intermediario que exporta el CSS correcto:

```typescript
// src/brand/tokens/loader.ts
// Este archivo NO es real — es un patrón conceptual.
// En Next.js, los imports de CSS deben ser estáticos.
```

La limitación de Next.js es que los imports de CSS deben ser estáticos. La solución limpia es generar un archivo `active-theme.css` durante el proceso de build:

```javascript
// next.config.js — añadir plugin de copia de tema
const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || 'default'
const fs = require('fs')
const path = require('path')

// Copiar el tema activo antes de compilar
const themeSource = path.join(
  __dirname,
  `src/brand/tokens/${BRAND_ID}/theme.css`
)
const themeDest = path.join(__dirname, `src/brand/tokens/active-theme.css`)

if (fs.existsSync(themeSource)) {
  fs.copyFileSync(themeSource, themeDest)
} else {
  fs.writeFileSync(themeDest, '/* No theme override for this brand */')
}
```

Y en `_app.tsx`, añadir:

```typescript
import '../brand/tokens/active-theme.css' // Tema del cliente activo
```

**Opción B — CSS custom properties desde JS (para multi-cliente en runtime):**

Si se necesita cambiar de cliente sin recompilar, inyectar variables CSS desde JavaScript al cargar la aplicación. Esto es más complejo y se documenta como mejora futura.

## Paso 8 — Probar el segundo cliente

```bash
# Cambiar a demo-client en .env.local
NEXT_PUBLIC_BRAND_ID=demo-client

npm run dev
```

Verificar:

- [ ] Logo de Demo Client en el Header
- [ ] Logo de Demo Client en el Footer
- [ ] Colores verdes en botones y acciones
- [ ] Textos del menú del `site.json` de demo-client
- [ ] Footer con el contenido de demo-client
- [ ] Landing con el contenido de `landing.json` de demo-client
- [ ] Copyright correcto en el footer

```bash
# Volver al cliente por defecto
NEXT_PUBLIC_BRAND_ID=default

npm run dev
```

Verificar que el cliente default se restaura completamente.

## Qué evitar

- No crear componentes de shell específicos para `demo-client`. Solo tokens, assets y contenido. El mismo Header y Footer sirven para todos los clientes.
- No modificar el código del resolver ni ningún componente para añadir el nuevo cliente. Solo el mapa de logos en `Logo/index.tsx` y el `next.config.js` para el tema.

## Entregable

- `src/brand/tokens/demo-client/theme.css`
- `src/brand/assets/demo-client/logo.svg` y en `public/`
- `src/brand/content/demo-client/site.json`
- `src/brand/content/demo-client/landing.json`
- `next.config.js` con la lógica de copia del tema activo
- `src/brand/tokens/active-theme.css` generado en build (añadir a `.gitignore`)

## Criterio de hecho

Cambiar `NEXT_PUBLIC_BRAND_ID` a `demo-client` transforma la identidad visual completa de la app. Volver a `default` la restaura. El proceso es solo cambiar la variable de entorno, sin tocar código.
