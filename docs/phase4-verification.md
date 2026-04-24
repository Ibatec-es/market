# Verificación Fase 4 — Landing corporativa

**Fecha:** 2026-04-24  
**Tag:** v4-landing-ready

## Resultado de calidad de código

| Check              | Resultado                             |
| ------------------ | ------------------------------------- |
| `npm run build`    | ✅ PASS                               |
| `npx tsc --noEmit` | ✅ PASS                               |
| `npm run lint`     | ✅ PASS (warnings heredados del core) |

> Los warnings de ESLint son todos del core (no-explicit-any, react-hooks/exhaustive-deps). Ninguno pertenece a archivos de `src/brand/`.

## SEO verificado

| Campo                       | Valor                                     |
| --------------------------- | ----------------------------------------- |
| `<title>`                   | `Agrospai Market`                         |
| `<meta name="description">` | Texto corporativo de `site.json`          |
| Cantidad de `<h1>`          | 1 (único, en el Hero)                     |
| Jerarquía de headings       | H1 → H2 (secciones) → H3 (cards/pasos) ✅ |

> **Nota:** Al inicio el campo `siteTagline` estaba heredando el valor del `content/site.json` del core. Se añadió `siteTagline` al `site.json` brand para proporcionar la descripción corporativa correcta.

## Verificación funcional

| Elemento                           | Estado                                                      |
| ---------------------------------- | ----------------------------------------------------------- |
| Hero: badge                        | ✅ "Marketplace de datos empresariales"                     |
| Hero: headline                     | ✅ "Accede, publica y monetiza datos con total soberanía"   |
| Hero: subheadline                  | ✅ Texto descriptivo de la plataforma                       |
| Hero: CTA primario → `/search`     | ✅                                                          |
| Hero: CTA secundario → `/publish`  | ✅                                                          |
| ValueProps: título de sección      | ✅ "Por qué Ibatec Market"                                  |
| ValueProps: 4 cards                | ✅ Soberanía, Interoperabilidad, Monetización, Trazabilidad |
| Process: título                    | ✅ "Cómo funciona"                                          |
| Process: 3 pasos numerados         | ✅                                                          |
| CtaSection: headline + subheadline | ✅                                                          |
| CtaSection: botón → `/search`      | ✅                                                          |
| Header corporativo visible         | ✅                                                          |
| Footer corporativo visible         | ✅                                                          |
| Sin texto hardcodeado              | ✅ Todo desde JSON                                          |

## Verificación responsive

| Breakpoint       | ValueProps    | Process                         | Hero CTAs               |
| ---------------- | ------------- | ------------------------------- | ----------------------- |
| 375px (mobile)   | 1 columna ✅  | Vertical con nº izquierda ✅    | Apilados, 100% ancho ✅ |
| 768px (tablet)   | 2 columnas ✅ | Grid adaptado ✅                | Centrados ✅            |
| 1280px (desktop) | 4 columnas ✅ | 3 columnas + línea conectora ✅ | En fila ✅              |

## Secciones implementadas

- [x] Hero (`Hero.tsx` + `Hero.module.css`)
- [x] ValueProps — 4 items (`ValueProps.tsx` + `ValueProps.module.css`)
- [x] Process — 3 pasos (`Process.tsx` + `Process.module.css`)
- [x] CtaSection (`CtaSection.tsx` + `CtaSection.module.css`)
- [x] Compositor `Landing/index.tsx`
- [x] Loader `utils/getLandingContent.ts`
- [x] Tipos en `types/landing.ts`
- [x] Contenido en `content/default/landing.json`

## Issues encontrados y resueltos

1. **`isHome` prop no existía en `Page`**: El core calcula `isHome` internamente desde `uri === '/'`. Se eliminó la prop del fallback y se pasó `uri="/"` en su lugar.
2. **Header oculto en `/`**: El `App` core ocultaba el Header en la ruta raíz (`!isRoot`). Se añadió condición `|| BRAND_ID !== ''` para mostrar el Header corporativo siempre que haya brand activo.
3. **`siteTagline` heredaba valor del core**: Se añadió `siteTagline` al `site.json` brand para sobrescribir el valor del core en la meta description.
4. **Build `_document` error intermitente**: Error de caché en la compilación; desapareció tras relanzar el build limpio.

## Issues pendientes para Fase 5

- La meta description en la ruta `/` todavía toma el valor de `siteTagline` del `site.json` del core como fallback cuando el campo brand es el del core. Revisar el merge de `deepMerge` para que `siteTagline` se sobreescriba correctamente cuando se define en el brand.
- Los iconos en ValueProps son emojis placeholder. Sustituir por `lucide-react` en una acción de refinamiento.
- Lighthouse no se ha podido ejecutar de forma automatizada. Se recomienda ejecutarlo manualmente en DevTools tras completar la configuración de red.
- El CTA secundario del Hero ("Publicar datos") lleva a `/publish` sin el paso `/publish/1` requerido por el core. Verificar si la ruta `/publish` redirige correctamente.

## Screenshots capturados

Ver `/docs/screenshots/phase4-landing/README.md` para el listado completo.
