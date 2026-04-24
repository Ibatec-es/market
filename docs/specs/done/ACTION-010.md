# ACTION-010 — Verificación de integridad post-habilitación

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: Las 4 modificaciones al core completadas (ACTION-006 a ACTION-009). Resolver activo.

Esta acción cierra la Fase 1. Es una acción de validación, no de desarrollo. El objetivo es confirmar que la infraestructura de extensión está correctamente instalada y que el proyecto no tiene regresiones.

## Objetivo de esta acción

Ejecutar una verificación exhaustiva del proyecto después de las 4 modificaciones al core. Documentar el resultado. Crear el tag de cierre de fase.

## Checklist de verificación

### 1. Build limpio

```bash
rm -rf .next
npm run build
```

Debe completar sin errores. Anotar cualquier warning de TypeScript aunque no bloquee el build.

```bash
npm run lint
```

Sin errores de lint en los archivos modificados.

### 2. Verificación en desarrollo

```bash
npm run dev
```

Navegar estas rutas y verificar que no hay errores en consola del navegador:

- [ ] `/` — Home
- [ ] `/search` o `/explore` — Catálogo
- [ ] Detalle de un asset
- [ ] `/publish`
- [ ] `/profile`
- [ ] Página de privacidad o términos

### 3. Verificar el resolver

En DevTools, verificar que los componentes renderizados son los correctos. No debe haber diferencia visual respecto al baseline de ACTION-003.

Abrir React DevTools (si está disponible) y confirmar que:

- El componente `Header` que se renderiza es el del core (no un componente brand vacío).
- El componente `Footer` ídem.

### 4. Verificar los tokens CSS

En DevTools, inspeccionar el `<html>` o `<body>` y confirmar que:

- Las variables CSS del core (`--color-*`, `--font-*`, etc.) están presentes.
- No hay variables `--brand-test` ni ninguna variable de test residual de ACTION-006.

### 5. Verificar el merge de siteContent

Confirmar que `src/brand/content/default/site.json` contiene `{}` y que no hay ningún override activo.

En la app, el título del sitio, el menú y el footer deben ser los del `content/site.json` original.

### 6. Comparar screenshots con baseline

Capturar las mismas pantallas del baseline (ACTION-003) y comparar visualmente:

```bash
# Capturar estado actual
mkdir -p docs/screenshots/post-phase1
# Capturar las pantallas principales
```

La comparación debe mostrar **cero diferencias visuales**.

### 7. Verificar el diff con el core

```bash
git diff upstream/main --name-only
```

La lista de archivos modificados respecto al upstream debe ser exactamente:

```
docs/environment.md
docs/fork-diff.md
docs/screenshots/...
src/pages/_app.tsx
src/components/App/index.tsx
src/components/@shared/atoms/Logo/index.tsx
src/@context/MarketMetadata/index.tsx
src/brand/   (archivos nuevos)
.env.example
```

Si hay archivos del core modificados que no están en esta lista, es una regresión. Investigar y corregir.

### 8. Verificar TypeScript estricto

```bash
npx tsc --noEmit
```

Sin errores de TypeScript en los archivos nuevos ni en los modificados.

## Documentar el resultado

Crear `docs/phase1-verification.md`:

```markdown
# Verificación Fase 1 — Infraestructura de extensión

Fecha: [fecha]
Tag de inicio: v0-synced
Tag de cierre: v1-extension-ready

## Resultado

- Build: PASS / FAIL
- Lint: PASS / FAIL (N warnings)
- TypeScript: PASS / FAIL
- Rutas verificadas: N/N
- Diferencias visuales respecto a baseline: NINGUNA / [lista si las hay]

## Archivos modificados del core

| Archivo                                     | Modificación         | Documentado en fork-diff.md |
| ------------------------------------------- | -------------------- | --------------------------- |
| src/pages/\_app.tsx                         | Import CSS brand     | MOD-001 ✓                   |
| src/components/App/index.tsx                | Imports via resolver | MOD-002 ✓                   |
| src/components/@shared/atoms/Logo/index.tsx | Props opcionales     | MOD-003 ✓                   |
| src/@context/MarketMetadata/index.tsx       | Merge de content     | MOD-004 ✓                   |

## Archivos nuevos (capa brand)

- src/brand/README.md
- src/brand/resolver.ts
- src/brand/tokens/base.css
- src/brand/tokens/default/theme.css
- src/brand/utils/deepMerge.ts
- src/brand/types/shell.ts
- src/brand/components/ (estructura vacía)
- src/brand/assets/default/logo.svg
- src/brand/content/default/site.json

## Issues encontrados

[Lista de problemas encontrados y si se resolvieron o quedan pendientes]

## Notas para Fase 2

[Cualquier observación relevante para la siguiente fase]
```

## Crear el tag de cierre de fase

```bash
git add .
git commit -m "feat: phase 1 complete — brand extension infrastructure"
git tag v1-extension-ready
git push origin main --tags
```

## Patrón a seguir

Si se encuentra cualquier diferencia visual respecto al baseline, detener y corregir antes de crear el tag. El tag `v1-extension-ready` solo se crea cuando la verificación es 100% limpia.

## Qué evitar

- No crear el tag si hay errores de TypeScript o diferencias visuales.
- No "resolver rápido" un problema para pasar la verificación. Si algo no funciona, la causa correcta está en una de las 4 modificaciones al core — revisar ACTION-006 a ACTION-009.

## Entregable

- `docs/phase1-verification.md` con el resultado completo.
- Tag `v1-extension-ready` en el repositorio remoto.

## Criterio de hecho

Build limpio, lint limpio, TypeScript limpio, cero diferencias visuales, diff con upstream limitado a los 4 archivos documentados más los archivos nuevos de `src/brand/`. Tag `v1-extension-ready` en remoto.
