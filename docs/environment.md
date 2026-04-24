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

| Ruta     | Estado | Observaciones                                              |
| -------- | ------ | ---------------------------------------------------------- |
| /        | OK     | Cargando correctamente con variables de entorno corregidas |
| /search  | OK     | Funcionando                                                |
| /publish | OK     | Funcionando                                                |
| /profile | OK     | Funcionando                                                |
| /terms   | OK     | Funcionando                                                |
| /privacy | OK     | Funcionando                                                |

> [!NOTE]
> La aplicación carga correctamente tras corregir el formato JSON de `NEXT_PUBLIC_NODE_URI_INDEXED` en el archivo `.env`. Se ha verificado que `JSON.parse()` funciona correctamente ahora.

## Nota sobre Docker

El comando `docker compose up` funciona en arquitecturas ARM64 (Apple Silicon) tras añadir `platform: linux/amd64` al servicio `ocean-market` en `docker-compose.yml`. Esto permite ejecutar la imagen mediante Rosetta 2.

## Sincronización con upstream

- Fecha de sync: 2026-04-24
- Último commit del upstream incorporado: `b81f01cd` (Merge pull request #359 from OceanProtocolEnterprise/feat/stage)
- Commits del upstream no presentes antes del merge: 86
- Archivos en conflicto resueltos: ninguno (auto-merge en `package-lock.json`)
- Archivos del core relevantes modificados por upstream:
  - `src/pages/_app.tsx`
  - `src/components/Header/` (cambios masivos en Wallet/Details y Menu)
  - `src/components/Home/Menu/` (SsiWallet movido/eliminado)
  - `package.json` (actualización de `@oceanprotocol/lib` a v8.0.5)
