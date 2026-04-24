# ACTION-018 — Verificación de shell completo

## Contexto del proyecto

Estado previo: ACTION-017 completada. Header, Footer y Logo corporativos funcionando.

## Objetivo

Validar el shell completo (Header + Footer + Logo) en todas las rutas y viewports. Crear tag de cierre de Fase 3.

## Checklist

### Build y lint

```bash
npm run build && npm run lint && npx tsc --noEmit
```

### Verificación por ruta

Para cada ruta, verificar Header y Footer:

| Ruta          | Header OK | Footer OK | Logo OK | Mobile OK |
| ------------- | --------- | --------- | ------- | --------- |
| `/`           |           |           |         |           |
| `/search`     |           |           |         |           |
| `/asset/[id]` |           |           |         |           |
| `/publish`    |           |           |         |           |
| `/profile`    |           |           |         |           |
| `/privacy`    |           |           |         |           |

### Verificación funcional

- [ ] Navegación desde el Header funciona en todas las rutas
- [ ] Wallet connect/disconnect no está roto
- [ ] El drawer mobile abre y cierra correctamente
- [ ] Navegar desde el drawer mobile cierra el drawer
- [ ] El header es sticky (permanece visible al hacer scroll)
- [ ] El footer está siempre al final del contenido

### Verificación responsive (3 breakpoints)

- [ ] 375px — Mobile: nav oculta, toggle visible, footer en columna
- [ ] 768px — Tablet: revisar transición entre layouts
- [ ] 1280px — Desktop: nav visible, footer en 3 columnas

### Comparar con screenshots de baseline

```bash
mkdir -p docs/screenshots/phase3-shell
```

Capturar Header y Footer en desktop y mobile. Comparar con baseline.

## Tag de cierre

```bash
git add .
git commit -m "feat: phase 3 complete — corporate shell (header, footer, logo)"
git tag v3-shell-ready
git push origin main --tags
```

## Criterio de hecho

Shell corporativo coherente en todas las rutas y viewports. Funcionalidad de wallet intacta. Tag `v3-shell-ready` en remoto.

---
