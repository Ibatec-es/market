# ACTION-028 — Ajustar perfil de usuario y vistas secundarias

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-027 completada. Formularios ajustados.

## Objetivo

Revisar y ajustar las vistas secundarias del marketplace: perfil de usuario, historial de transacciones, configuración y cualquier otra pantalla que no haya sido cubierta en acciones anteriores. Documentar cualquier componente que resista la tematización.

## Paso 1 — Inventario de vistas secundarias

```bash
# Listar todas las páginas del proyecto
find src/pages -name "*.tsx" | grep -v "_app\|_document\|index\|api" | sort
```

Para cada página encontrada, navegar y anotar si está cubierta por los overrides actuales o si necesita trabajo adicional:

| Ruta              | Descripción                   | Estado      |
| ----------------- | ----------------------------- | ----------- |
| `/profile`        | Perfil de usuario             | Por revisar |
| `/profile/[tab]`  | Tabs del perfil               | Por revisar |
| `/history`        | Historial de transacciones    | Por revisar |
| `/[slug]`         | Páginas de contenido markdown | Por revisar |
| `/privacy/[slug]` | Páginas legales               | Por revisar |

## Paso 2 — Vista de perfil de usuario

```bash
find src/components -name "*.tsx" | xargs grep -l "profile\|Profile\|user\|User" | head -10
find src/components -name "*.module.css" | xargs grep -l "profile\|avatar\|Avatar" | head -5
```

Elementos típicos a revisar:

**Avatar del usuario:**

```css
/* Override para avatar circular */
[class*='avatar'],
[class*='Avatar'] {
  border-radius: var(--radius-full) !important;
  border: 2px solid var(--color-border) !important;
}
```

**Tabs de navegación del perfil:**

```css
/* Tabs corporativos */
[class*='profileTab'],
[class*='ProfileTab'],
[class*='tab'][role='tab'] {
  font-size: var(--text-sm) !important;
  font-weight: var(--font-weight-medium) !important;
  color: var(--color-text-secondary) !important;
  border-bottom: 2px solid transparent !important;
  padding-bottom: var(--space-3) !important;
  transition: var(--transition-colors) !important;
}

[class*='tab'][role='tab'][aria-selected='true'],
[class*='tab--active'],
[class*='tabActive'] {
  color: var(--color-text-primary) !important;
  border-bottom-color: var(--color-action-primary) !important;
}
```

**Tabla o lista de assets publicados:**

```css
/* Tabla de assets del usuario */
[class*='userAssets'],
[class*='publishedAssets'] {
  border: var(--card-border) !important;
  border-radius: var(--card-radius) !important;
}
```

## Paso 3 — Historial de transacciones

El historial muestra transacciones en blockchain. Sus elementos clave son:

- Tabla con columnas: fecha, tipo, asset, precio, estado
- Hashes de transacción en monospace
- Badges de estado (completado, pendiente, fallido)

```css
/* ============================================================
   HISTORIAL DE TRANSACCIONES
   ============================================================ */

/* Tabla de historial */
[class*='history'],
[class*='History'],
[class*='transactions'] {
  border: var(--card-border) !important;
  border-radius: var(--card-radius) !important;
  overflow: hidden !important;
}

/* Hashes de transacción */
[class*='txHash'],
[class*='transactionHash'],
[class*='tx-hash'] {
  font-family: var(--font-mono) !important;
  font-size: var(--text-xs) !important;
}

/* Badges de estado */
[class*='statusBadge'][class*='success'],
[class*='status--completed'] {
  background-color: color-mix(
    in srgb,
    var(--color-success) 15%,
    transparent
  ) !important;
  color: var(--color-success) !important;
  border-radius: var(--radius-sm) !important;
}

[class*='statusBadge'][class*='pending'],
[class*='status--pending'] {
  background-color: color-mix(
    in srgb,
    var(--color-warning) 15%,
    transparent
  ) !important;
  color: var(--color-warning) !important;
  border-radius: var(--radius-sm) !important;
}

[class*='statusBadge'][class*='error'],
[class*='status--failed'] {
  background-color: color-mix(
    in srgb,
    var(--color-error) 15%,
    transparent
  ) !important;
  color: var(--color-error) !important;
  border-radius: var(--radius-sm) !important;
}
```

> **Nota sobre `color-mix`:** Si el navegador objetivo no soporta `color-mix`, usar versiones RGBA alternativas: `background-color: rgba(22, 163, 74, 0.12)`. Verificar el soporte en el contexto del proyecto.

## Paso 4 — Páginas de contenido markdown

Las páginas generadas desde `content/pages/*.md` usan un wrapper de página genérico. Verificar que el contenido markdown se renderiza con la tipografía correcta:

```css
/* ============================================================
   CONTENIDO MARKDOWN / PÁGINAS DE CONTENIDO
   ============================================================ */

[class*='markdownContent'],
[class*='MarkdownContent'],
[class*='prose'] {
  font-family: var(--font-body) !important;
  font-size: var(--text-base) !important;
  color: var(--color-text-primary) !important;
  line-height: var(--leading-relaxed) !important;
  max-width: 72ch !important; /* Ancho óptimo de lectura */
}

[class*='markdownContent'] h1,
[class*='prose'] h1 {
  font-family: var(--font-display) !important;
  font-size: var(--text-3xl) !important;
  font-weight: var(--font-weight-semibold) !important;
  margin-bottom: var(--space-6) !important;
}

[class*='markdownContent'] h2,
[class*='prose'] h2 {
  font-family: var(--font-display) !important;
  font-size: var(--text-xl) !important;
  font-weight: var(--font-weight-semibold) !important;
  margin-top: var(--space-10) !important;
  margin-bottom: var(--space-4) !important;
}

[class*='markdownContent'] a,
[class*='prose'] a {
  color: var(--color-action-primary) !important;
  text-decoration: underline !important;
  text-underline-offset: 2px !important;
}

[class*='markdownContent'] code,
[class*='prose'] code {
  font-family: var(--font-mono) !important;
  font-size: 0.875em !important;
  background-color: var(--color-bg-secondary) !important;
  border: var(--card-border) !important;
  border-radius: var(--radius-sm) !important;
  padding: 0.1em 0.3em !important;
}
```

## Paso 5 — Modales y overlays

Los modales aparecen en varias partes del marketplace (confirmación de compra, detalles adicionales, etc.):

```css
/* ============================================================
   MODALES Y OVERLAYS
   ============================================================ */

[class*='modal'],
[class*='Modal'],
[role='dialog'] {
  border-radius: var(--radius-xl) !important;
  box-shadow: var(--shadow-lg) !important;
  border: var(--card-border) !important;
}

[class*='modalOverlay'],
[class*='backdrop'] {
  background-color: rgba(15, 23, 42, 0.6) !important; /* slate-900 al 60% */
  backdrop-filter: blur(4px) !important;
}

[class*='modalHeader'],
[class*='dialogHeader'] {
  border-bottom: var(--card-border) !important;
  padding: var(--space-5) var(--space-6) !important;
}

[class*='modalFooter'],
[class*='dialogFooter'] {
  border-top: var(--card-border) !important;
  padding: var(--space-4) var(--space-6) !important;
}
```

## Paso 6 — Toasts y notificaciones

```css
/* ============================================================
   TOASTS / NOTIFICACIONES
   ============================================================ */

/* Si usa react-toastify u otra librería */
[class*='Toastify__toast'],
.Toastify__toast {
  border-radius: var(--radius-lg) !important;
  font-family: var(--font-body) !important;
  font-size: var(--text-sm) !important;
  box-shadow: var(--shadow-md) !important;
}

.Toastify__toast--success {
  background-color: color-mix(
    in srgb,
    var(--color-success) 10%,
    white
  ) !important;
  color: var(--color-success) !important;
  border: 1px solid color-mix(in srgb, var(--color-success) 30%, transparent) !important;
}

.Toastify__toast--error {
  background-color: color-mix(
    in srgb,
    var(--color-error) 10%,
    white
  ) !important;
  color: var(--color-error) !important;
  border: 1px solid color-mix(in srgb, var(--color-error) 30%, transparent) !important;
}
```

## Paso 7 — Revisión global: pantalla por pantalla

Navegar sistemáticamente todas las rutas del inventario del Paso 1 y verificar:

- [ ] `/profile` — perfil de usuario
- [ ] `/profile/[tab]` — tabs y contenido
- [ ] Historial de transacciones
- [ ] Páginas de contenido markdown (privacy, terms)
- [ ] Modales (abrir cualquier modal del marketplace)
- [ ] Toasts (provocar una acción que genere una notificación)

Para cada vista, anotar si está cubierta o si necesita override adicional.

## Paso 8 — Documentar componentes resistentes

Si algún componente usa `!important` en el core o tiene especificidad tan alta que los overrides no funcionan, documentarlo en `docs/token-exceptions.md` como "requiere wrapper":

```markdown
### ComponenteX

**Estado:** Resistente a overrides CSS
**Motivo:** Usa estilos inline o especificidad muy alta
**Solución propuesta:** Crear wrapper en `brand/components/` que envuelve el componente
del core y sobreescribe los estilos con `style` prop o clase adicional
**Prioridad:** Alta / Media / Baja
```

## Entregable

- `src/brand/tokens/base.css` con overrides de vistas secundarias, modales y toasts.
- `docs/token-exceptions.md` actualizado con todos los componentes resistentes.
- Todas las vistas del marketplace son visualmente coherentes.

## Criterio de hecho

No hay ninguna pantalla funcional que muestre el aspecto original del core de forma prominente. Los componentes resistentes están documentados. `npm run build` sin errores.
