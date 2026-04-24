# ACTION-013 — Ajustar espaciado, radios y elevación

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-012 completada. Tipografía corporativa aplicada.

## Objetivo de esta acción

Completar el sistema de tokens con las variables de espaciado, border-radius y sombras. Esto cierra la capa de tokens y alinea todos los detalles de la interfaz con el estilo minimalista profesional.

## Paso 1 — Auditar variables de espaciado y radios del core

```bash
cat src/stylesGlobal/_variables.css
grep -r "border-radius" src/stylesGlobal/ --include="*.css"
grep -r "box-shadow" src/stylesGlobal/ --include="*.css"
grep -r "padding\|margin\|gap" src/stylesGlobal/ --include="*.css" | grep "var(--"
```

Identificar:

- Variables de spacing (`--space-*`, `--gap-*`, `--padding-*`)
- Variables de border-radius (`--radius-*`, `--rounded-*`)
- Variables de sombra (`--shadow-*`, `--elevation-*`)

## Paso 2 — Añadir tokens de espaciado en `base.css`

```css
/* src/brand/tokens/base.css — añadir a continuación de la tipografía */

/* ============================================================
   ESPACIADO — sistema de 8px
   ============================================================ */
:root {
  --space-1: 0.25rem; /*  4px */
  --space-2: 0.5rem; /*  8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */

  /* Semánticos de layout */
  --space-section: var(--space-20); /* Entre secciones grandes */
  --space-component: var(--space-12); /* Entre componentes medianos */
  --space-element: var(--space-6); /* Entre elementos dentro de un componente */
  --space-inline: var(--space-3); /* Entre elementos en línea */

  /* Contenedor */
  --container-max: 1280px;
  --container-pad: var(--space-6); /* Padding lateral del contenedor */
}

/* ============================================================
   BORDER RADIUS
   ============================================================ */
:root {
  --radius-sm: 4px; /* Tags, badges, chips */
  --radius-md: 6px; /* Botones, inputs, controles interactivos */
  --radius-lg: 8px; /* Cards, paneles, dropdowns */
  --radius-xl: 12px; /* Modales, sheets */
  --radius-full: 9999px; /* Pills, avatares circulares */
}

/* ============================================================
   SOMBRAS — minimalismo: solo funcionales
   ============================================================ */
:root {
  /* Sin sombra decorativa. Solo para elementos que flotan sobre el contenido. */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 /
          0.05);

  /* Contextos de uso:
     --shadow-sm  → hover de cards, elevación sutil
     --shadow-md  → dropdowns, tooltips, popovers
     --shadow-lg  → modales, drawers
  */

  /* Cards: usar borde en lugar de sombra */
  --card-border: 1px solid var(--color-border);
  --card-border-hover: 1px solid var(--color-border-strong);
  --card-radius: var(--radius-lg);
}

/* ============================================================
   TRANSICIONES
   ============================================================ */
:root {
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;

  /* Propiedades que se transicionan frecuentemente */
  --transition-colors: color var(--transition-base), background-color var(--transition-base),
    border-color var(--transition-base);
}
```

## Paso 3 — Mapear con variables del core

Las variables del core pueden tener nombres distintos. Por ejemplo, si el core usa `--border-radius-sm` y el sistema brand usa `--radius-sm`, necesitamos mapear:

```css
/* Mapeo de compatibilidad — nombres del core → tokens brand */
:root {
  --border-radius-sm: var(--radius-sm);
  --border-radius-md: var(--radius-md);
  --border-radius-lg: var(--radius-lg);
  /* etc. Ajustar según nombres reales del core */
}
```

Verificar con:

```bash
grep -r "border-radius" src/components/ --include="*.css" -h | grep "var(--" | sort -u
```

## Paso 4 — Eliminar sombras decorativas

Si el core usa sombras decorativas en cards o en el header, sobreescribirlas con el valor del sistema brand:

```css
/* Neutralizar sombras decorativas del core */
:root {
  --shadow-card: none; /* Si el core define --shadow-card */
  --header-shadow: var(--card-border); /* Reemplazar sombra por borde */
}
```

Verificar visualmente que el resultado no elimina sombras funcionales (modales, dropdowns). Si alguna sombra funcional desaparece, añadirla de vuelta con el token correcto.

## Paso 5 — Verificación visual

```bash
npm run dev
```

Revisar visualmente:

- [ ] Cards con borde en lugar de sombra
- [ ] Botones con radio de 6px
- [ ] Inputs con radio de 6px
- [ ] Modales con radio de 12px
- [ ] Espaciado de secciones coherente con el sistema de 8px
- [ ] Transiciones suaves en hover de botones y links

## Paso 6 — Captura de progreso

```bash
mkdir -p docs/screenshots/phase2-tokens
```

Capturar las pantallas principales y comparar con el baseline. La diferencia debe ser visible (colores, tipografía, espaciado, radios) pero sin roturas funcionales.

## Qué evitar

- No añadir sombras donde el diseño dice "sin sombra". La coherencia es más importante que el efecto visual en cada elemento individual.
- No usar valores de espaciado que no sean múltiplos de 4 (idealmente de 8).
- No sobreescribir `z-index` en este paso. Los z-index se gestionan cuando se implementan los componentes custom.

## Entregable

- `src/brand/tokens/base.css` completo con espaciado, radios y sombras.
- Sistema de diseño visible en la app.

## Criterio de hecho

La app muestra el sistema visual completo: colores, tipografía, espaciado y radios coherentes. No hay sombras decorativas. `npm run build` sin errores.
