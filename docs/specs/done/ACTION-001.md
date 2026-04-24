# ACTION-001 — Clonar y verificar el estado actual del fork

## Contexto del proyecto

Estás trabajando en un fork de `OceanProtocolEnterprise/market` llamado `Ibatec-es/market`. Es un marketplace de datos construido con Next.js, TypeScript y CSS Modules. El objetivo del proyecto es personalizar la UI para uso corporativo multi-cliente, manteniendo el fork sincronizable con el upstream.

Esta es la primera acción del proyecto. No hay código custom todavía. El objetivo es verificar que el punto de partida es sólido.

## Objetivo de esta acción

Clonar el repositorio, instalar dependencias, arrancar en local y verificar que todas las rutas principales funcionan sin errores. Documentar el entorno y crear un tag de referencia.

## Tareas

### 1. Clonar el repositorio

```bash
git clone https://github.com/Ibatec-es/market.git
cd market
```

### 2. Instalar dependencias y arrancar

```bash
npm install
npm run dev
```

Verificar que no hay errores en la instalación. Si hay warnings de peer dependencies, documentarlos pero no bloquear.

### 3. Verificar rutas principales

Navegar manualmente o con un script de smoke test a estas rutas:

- `/` — Home / Landing
- `/search` o `/explore` — Catálogo de assets
- Un asset individual (cualquier URL de detalle)
- `/publish` — Publicación de asset (aunque requiera wallet)
- `/profile` — Perfil de usuario
- Cualquier página de contenido estático: `/privacy`, `/terms`, etc.

Para cada ruta anotar: carga correctamente / error de consola / error de red.

### 4. Documentar el entorno

Crear el archivo `docs/environment.md` con este contenido:

```markdown
# Entorno de desarrollo

- Node: [resultado de `node -v`]
- npm: [resultado de `npm -v`]
- Next.js: [versión en package.json]
- React: [versión en package.json]
- TypeScript: [versión en package.json]
- SO: [sistema operativo]
- Fecha de verificación: [fecha]

## Dependencias con versión fija relevantes

[listar cualquier dependencia pinned que pueda afectar al build]

## Warnings en instalación

[listar si los hay, o "ninguno"]

## Estado de rutas principales

| Ruta    | Estado     | Observaciones |
| ------- | ---------- | ------------- |
| /       | OK / ERROR | ...           |
| /search | OK / ERROR | ...           |

...
```

### 5. Crear tag de referencia

```bash
git add docs/environment.md
git commit -m "chore: add environment documentation"
git tag v0-baseline
git push origin main --tags
```

## Patrón a seguir

No modificar ningún archivo existente del proyecto en esta acción. Solo lectura, documentación y tag. Cualquier cambio en código es un error en esta fase.

## Qué evitar

- No actualizar dependencias aunque estén desactualizadas. Eso va en ACTION-002.
- No ejecutar `npm audit fix`. Puede romper cosas.
- No crear carpetas nuevas más allá de `docs/`.
- No hacer cambios en `next.config.js`, `.env` ni ningún archivo de configuración.

## Entregable

- Archivo `docs/environment.md` con el inventario del entorno y el estado de las rutas.
- Tag `v0-baseline` en el repositorio.

## Criterio de hecho

`npm run dev` levanta la app. La ruta `/` y al menos 3 rutas más cargan sin errores críticos en consola. El tag `v0-baseline` existe en el repo remoto.
