# ACTION-003 — Inventario visual: captura del estado actual

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-002 completada. Fork sincronizado con upstream. Tag `v0-synced`.

## Objetivo de esta acción

Capturar el estado visual actual del proyecto como referencia de comparación. Sirve para validar cambios durante el rediseño y para documentar el punto de partida ante el equipo o cliente.

## Tareas

### 1. Crear la carpeta de capturas

```
docs/
└── screenshots/
    └── baseline/
        ├── desktop/
        └── mobile/
```

### 2. Capturas a realizar

Para cada pantalla, capturar en **desktop (1280px)** y **mobile (375px)**.

| ID  | Pantalla                | URL                                      |
| --- | ----------------------- | ---------------------------------------- |
| 01  | Home / Landing          | `/`                                      |
| 02  | Catálogo / Búsqueda     | `/search`                                |
| 03  | Detalle de asset        | `/asset/[cualquier-id]`                  |
| 04  | Publicar asset          | `/publish`                               |
| 05  | Perfil de usuario       | `/profile`                               |
| 06  | Página de privacidad    | `/privacy`                               |
| 07  | Página de términos      | `/terms` (si existe)                     |
| 08  | Header — estado inicial | (recorte del header en `/`)              |
| 09  | Header — estado scroll  | (header tras hacer scroll)               |
| 10  | Footer                  | (recorte del footer en cualquier página) |
| 11  | Mobile nav / drawer     | (menú móvil abierto)                     |

Convención de nombres: `[ID]-[pantalla]-[viewport].png`
Ejemplo: `03-asset-detail-desktop.png`, `03-asset-detail-mobile.png`

### 3. Herramienta recomendada

Opción A — Playwright (recomendada si el proyecto ya lo tiene):

```bash
npx playwright screenshot --url http://localhost:3000 --output docs/screenshots/baseline/
```

Opción B — Script Node simple con Puppeteer:

```javascript
// scripts/screenshot-baseline.js
const puppeteer = require('puppeteer')

const routes = [
  { id: '01', name: 'home', path: '/' },
  { id: '02', name: 'search', path: '/search' }
  // ...
]

const viewports = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 375, height: 812 }
]

async function run() {
  const browser = await puppeteer.launch()
  for (const route of routes) {
    for (const vp of viewports) {
      const page = await browser.newPage()
      await page.setViewport({ width: vp.width, height: vp.height })
      await page.goto(`http://localhost:3000${route.path}`, {
        waitUntil: 'networkidle0'
      })
      await page.screenshot({
        path: `docs/screenshots/baseline/${vp.name}/${route.id}-${route.name}-${vp.name}.png`,
        fullPage: true
      })
      await page.close()
    }
  }
  await browser.close()
}

run()
```

Opción C — Manual con DevTools si no se quiere añadir dependencias.

### 4. Crear índice de capturas

Crear `docs/screenshots/baseline/README.md`:

```markdown
# Screenshots — Baseline (v0-synced)

Fecha: [fecha]
Rama: main
Tag: v0-synced

## Capturas disponibles

| Archivo                     | Pantalla | Viewport |
| --------------------------- | -------- | -------- |
| desktop/01-home-desktop.png | Home     | 1280px   |
| mobile/01-home-mobile.png   | Home     | 375px    |

...

## Notas visuales

[Cualquier observación relevante sobre el estado actual: componentes rotos, estilos inconsistentes, etc.]
```

## Patrón a seguir

Las capturas son solo documentación. No implican ningún juicio de valor todavía sobre qué cambiar. El objetivo es tener un "antes" objetivo.

Si alguna ruta requiere autenticación (wallet conectada), capturar el estado sin autenticar y anotar en el README que el estado autenticado no está cubierto en el baseline.

## Qué evitar

- No modificar código para que las capturas "queden mejor". Capturar el estado real.
- No saltarse capturas móviles. Son críticas para validar responsive en fases posteriores.
- No usar capturas de pantalla del sistema operativo (con marcos de ventana). Solo el contenido del navegador.

## Entregable

- Carpeta `docs/screenshots/baseline/` con todas las capturas organizadas.
- `docs/screenshots/baseline/README.md` con el índice.

## Criterio de hecho

Existen capturas desktop y mobile para las 11 pantallas listadas. El README tiene el índice completo. Las imágenes están commiteadas en el repositorio (o en un directorio ignorado por git con referencia en el README, si son demasiado pesadas).
