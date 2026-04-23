# Entorno de desarrollo

- Node: v21.7.0
- npm: 10.8.3
- Next.js: ^15.5.11
- React: ^18.2.0
- TypeScript: ^5.9.3
- SO: macOS (ARM64)
- Fecha de verificación: 2026-04-23

## Dependencias con versión fija relevantes

- `@urql/exchange-refocus`: 1.0.0
- `@oceanprotocol/ddo-js`: ^0.1.4
- `graphql`: ^16.12.0

## Warnings en instalación

- Múltiples peer dependency warnings relacionados con `@react-three/fiber` y `react-native` (requieren React 19 pero el proyecto usa React 18).
- Unsupported engine warnings para Node.js (el proyecto requiere Node 22 o 20, se está usando 21.7.0).
- Deprecated packages: `har-validator`, `request`, `rimraf`, `mkdirp-promise`, etc.

## Estado de rutas principales

| Ruta     | Estado | Observaciones                                                         |
| -------- | ------ | --------------------------------------------------------------------- |
| /        | ERROR  | Runtime SyntaxError: JSON.parse falla en NEXT_PUBLIC_NODE_URI_INDEXED |
| /search  | ERROR  | Mismo error de inicialización (SyntaxError)                           |
| /publish | ERROR  | Mismo error de inicialización (SyntaxError)                           |
| /profile | ERROR  | Mismo error de inicialización (SyntaxError)                           |
| /terms   | ERROR  | Mismo error de inicialización (SyntaxError)                           |
| /privacy | ERROR  | Mismo error de inicialización (SyntaxError)                           |

> [!IMPORTANT]
> La aplicación no carga correctamente en el navegador debido a un error de sintaxis en la configuración de las variables de entorno. Específicamente, `NEXT_PUBLIC_NODE_URI_INDEXED` en el archivo `.env` tiene un formato JSON inválido (`[https://...]` sin comillas), lo que provoca que `JSON.parse()` falle en `app.config.cjs:171`.

## Nota sobre Docker

El comando `docker compose up` falla en arquitecturas ARM64 (Apple Silicon) porque la imagen `oceanenterprise/market:latest` no dispone de manifiesto para `linux/arm64/v8`. Se recomienda el desarrollo local con `npm run start` (que ejecuta `next dev`).
