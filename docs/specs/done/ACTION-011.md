# ACTION-011 — Definir paleta de colores corporativa en tokens

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-010 completada. Tag `v1-extension-ready`. Infraestructura de extensión operativa.

Esta acción inicia la Fase 2 — Tokens. Es el primer cambio visual real del proyecto.

## Objetivo de esta acción

Auditar todas las variables CSS de color del core y definir la paleta corporativa en `src/brand/tokens/base.css` mediante overrides de `:root`. Sin tocar ningún componente.

## Paso 1 — Auditoría de variables de color del core

```bash
cat src/stylesGlobal/_colors.css
cat src/stylesGlobal/_variables.css
grep -r "var(--" src/stylesGlobal/ | grep -v ".css:"
```

Generar un inventario de todas las variables CSS de color en uso. Formato esperado:

```
--color-primary
--color-secondary
--color-background
--color-text
--color-border
--color-error
--color-success
... etc
```

También buscar variables de color en componentes individuales:

```bash
grep -r "var(--color" src/components/ --include="*.css" -h | sort -u
```

### Identificar variables sin token (valores literales hardcodeados)

```bash
grep -r "#[0-9a-fA-F]\{3,6\}" src/components/ --include="*.css" -h | sort -u
```

Estos valores literales no responden a los tokens. Documentarlos como deuda técnica — se abordan en Fase 5, no ahora.

## Paso 2 — Definir la paleta corporativa

Crear la paleta en `src/brand/tokens/base.css`. Estructura recomendada en tres capas:

```css
/* src/brand/tokens/base.css */

/* ============================================================
   CAPA 1 — Primitivos
   Valores absolutos. No se usan directamente en componentes.
   ============================================================ */
:root {
  /* Grises */
  --primitive-slate-50: #f8fafc;
  --primitive-slate-100: #f1f5f9;
  --primitive-slate-200: #e2e8f0;
  --primitive-slate-400: #94a3b8;
  --primitive-slate-600: #475569;
  --primitive-slate-800: #1e293b;
  --primitive-slate-900: #0f172a;

  /* Azul corporativo — ajustar al color de marca real */
  --primitive-blue-50: #eff6ff;
  --primitive-blue-100: #dbeafe;
  --primitive-blue-600: #2563eb;
  --primitive-blue-700: #1d4ed8;
  --primitive-blue-800: #1e40af;

  /* Semánticos de estado */
  --primitive-red-600: #dc2626;
  --primitive-green-600: #16a34a;
  --primitive-amber-500: #f59e0b;
}

/* ============================================================
   CAPA 2 — Semánticos
   Mapean primitivos a usos funcionales.
   Estos son los que se sobreescriben por cliente en theme.css
   ============================================================ */
:root {
  /* Superficies */
  --color-bg-primary: var(--primitive-slate-50);
  --color-bg-secondary: var(--primitive-slate-100);
  --color-bg-inverse: var(--primitive-slate-900);

  /* Texto */
  --color-text-primary: var(--primitive-slate-900);
  --color-text-secondary: var(--primitive-slate-600);
  --color-text-disabled: var(--primitive-slate-400);
  --color-text-inverse: var(--primitive-slate-50);

  /* Bordes */
  --color-border: var(--primitive-slate-200);
  --color-border-strong: var(--primitive-slate-400);

  /* Acción primaria */
  --color-action-primary: var(--primitive-blue-600);
  --color-action-primary-hover: var(--primitive-blue-700);
  --color-action-primary-bg: var(--primitive-blue-50);
  --color-action-primary-text: #ffffff;

  /* Estados semánticos */
  --color-error: var(--primitive-red-600);
  --color-success: var(--primitive-green-600);
  --color-warning: var(--primitive-amber-500);
}
```

> **Importante:** Las variables de la Capa 2 deben tener los mismos nombres que las variables del core que se quiere sobreescribir. Si el core usa `--color-primary`, el override debe llamarse `--color-primary`, no `--color-action-primary`.

Verificar los nombres exactos en el paso de auditoría y ajustar.

## Paso 3 — Verificar la aplicación de tokens

```bash
npm run dev
```

Abrir la app y comprobar visualmente:

- El color de los botones primarios ha cambiado al azul corporativo.
- Los textos usan el color slate definido.
- Los fondos son los correctos.

En DevTools, verificar que las variables de la Capa 2 sobreescriben correctamente las del core:

```
Inspeccionar :root → debe mostrar las variables del core Y las del brand
Las variables del brand deben aparecer después (mayor especificidad de cascada)
```

## Paso 4 — Verificar en dark mode (si el core lo soporta)

```bash
grep -r "prefers-color-scheme" src/stylesGlobal/ --include="*.css"
```

Si el core soporta dark mode, verificar que los overrides no rompen el tema oscuro. Si es necesario, añadir overrides para dark mode:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: var(--primitive-slate-900);
    /* ... */
  }
}
```

## Qué evitar

- No sobreescribir variables del core con valores literales. Siempre referenciar primitivos: `var(--primitive-blue-600)`, no `#2563eb`.
- No añadir variables nuevas que no existan en el core (eso va en ACTION-013 para el sistema de diseño completo). Aquí solo se sobreescriben las existentes.
- No modificar `src/stylesGlobal/_colors.css` del core.

## Entregable

- `src/brand/tokens/base.css` con la paleta corporativa completa.
- Paleta visible en la app.

## Criterio de hecho

La app muestra los colores corporativos en botones, textos, fondos y bordes. `npm run build` sin errores. Ningún archivo del core modificado.
