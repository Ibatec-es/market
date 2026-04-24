# ACTION-024 — Verificación de landing completa

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-023 completada. Landing corporativa integrada en la ruta `/`.

Esta acción cierra la Fase 4. Es una acción de validación, rendimiento y documentación.

## Objetivo

Verificar que la landing corporativa es funcional, responsive, rápida y bien posicionada para SEO. Crear el tag de cierre de fase.

## Checklist completo

### 1. Build y calidad de código

```bash
npm run build
npm run lint
npx tsc --noEmit
```

Sin errores. Anotar warnings si los hay.

### 2. Verificación funcional

Navegar la landing en el navegador y verificar:

- [ ] Hero renderiza: badge, headline, subheadline, CTA primario, CTA secundario
- [ ] ValueProps renderiza: título de sección + 4 cards con icono, título y descripción
- [ ] Process renderiza: título de sección + 3 pasos con número, título y descripción
- [ ] CtaSection renderiza: headline, subheadline, botón de CTA
- [ ] CTA primario del Hero navega a `/search` (o la ruta configurada en el JSON)
- [ ] CTA secundario del Hero navega a `/publish`
- [ ] Botón de CtaSection navega correctamente
- [ ] Header corporativo visible y funcional en la landing
- [ ] Footer corporativo visible en la landing
- [ ] No hay texto hardcodeado (todo viene del JSON)

### 3. Verificación responsive

Redimensionar manualmente o usar DevTools Device Toolbar:

**Mobile (375px):**

- [ ] Hero: texto centrado, CTAs en columna a ancho completo
- [ ] ValueProps: 1 columna
- [ ] Process: pasos en vertical con número a la izquierda
- [ ] CtaSection: botón a ancho completo
- [ ] No hay overflow horizontal

**Tablet (768px):**

- [ ] ValueProps: 2 columnas
- [ ] Process: revisar si el grid se adapta bien
- [ ] Sin elementos cortados

**Desktop (1280px):**

- [ ] Todos los layouts de múltiples columnas correctos
- [ ] Ancho máximo del contenedor respetado

### 4. Verificación de rendimiento

Usar Lighthouse en DevTools (modo desktop y mobile):

```
Lighthouse → Navigation → Mobile + Desktop
```

Objetivos mínimos:

- Performance: > 85
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

Métricas específicas a verificar:

- **LCP (Largest Contentful Paint):** < 2.5s
- **CLS (Cumulative Layout Shift):** < 0.1 (las fuentes no deben producir layout shift)
- **FID / INP:** < 200ms

Si el LCP o CLS están fuera de rango, investigar:

- LCP alto → verificar que las fuentes se precargan con `<link rel="preload">`
- CLS alto → añadir `font-display: swap` en la carga de fuentes o definir `size-adjust` para reducir el FOUT

```css
/* En _document.tsx, añadir preload para la fuente más crítica */
<link
  rel="preload"
  href="https://fonts.googleapis.com/css2?family=DM+Sans..."
  as="style"
/>
```

### 5. Verificación SEO

```bash
# View Source en el navegador para verificar el HTML renderizado
curl http://localhost:3000 | grep -E "<title>|<meta name|<meta property"
```

Verificar:

- [ ] `<title>` tiene el valor correcto del `siteContent`
- [ ] `<meta name="description">` tiene contenido
- [ ] No hay etiquetas `<h1>` duplicadas (la landing solo debe tener un H1 en el Hero)
- [ ] Las imágenes tienen atributos `alt`

### 6. Verificación de accesibilidad básica

En DevTools → Accessibility:

- [ ] El orden de headings es correcto: H1 (Hero) → H2 (secciones) → H3 (items)
- [ ] Los botones/links tienen labels descriptivos
- [ ] El contraste de color supera el ratio mínimo WCAG AA (4.5:1 para texto normal)
- [ ] El drawer mobile se puede cerrar con teclado (tecla Escape)

### 7. Capturar screenshots finales de la landing

```bash
mkdir -p docs/screenshots/phase4-landing
```

Capturar en desktop (1280px) y mobile (375px):

- Landing completa (scroll completo)
- Hero
- ValueProps
- Process
- CtaSection

Crear `docs/screenshots/phase4-landing/README.md` con fecha y descripción de los cambios.

### 8. Verificar el diff total con upstream

```bash
git diff upstream/main --name-only
```

La lista debe ser exactamente:

- Los 5 archivos del core modificados (MOD-001 a MOD-005)
- `src/brand/` (todos los archivos nuevos)
- `docs/` (documentación)
- `public/brand/` (assets)
- `.env.example`

Si hay archivos del core no documentados en `fork-diff.md`, investigar y documentar.

## Crear tag de cierre de fase

```bash
git add .
git commit -m "feat: phase 4 complete — corporate landing page"
git tag v4-landing-ready
git push origin main --tags
```

## Documento de resumen de fase

Crear `docs/phase4-verification.md`:

```markdown
# Verificación Fase 4 — Landing corporativa

Fecha: [fecha]
Tag: v4-landing-ready

## Resultado

- Build: PASS
- Lint: PASS
- TypeScript: PASS
- Lighthouse Performance (mobile): [score]
- Lighthouse Performance (desktop): [score]
- LCP: [valor]
- CLS: [valor]
- SEO: PASS

## Secciones implementadas

- [x] Hero
- [x] ValueProps (N items)
- [x] Process (N pasos)
- [x] CtaSection

## Issues encontrados y resueltos

[Lista o "ninguno"]

## Issues pendientes para Fase 5

[Lista de refinamientos identificados]
```

## Qué evitar

- No crear el tag si Lighthouse Performance está por debajo de 75 en mobile. Investigar y corregir primero.
- No omitir la verificación de accesibilidad. Un ratio de contraste insuficiente en el CTA primario es un bloqueante.

## Entregable

- `docs/phase4-verification.md` con el resultado completo.
- `docs/screenshots/phase4-landing/` con capturas.
- Tag `v4-landing-ready` en remoto.

## Criterio de hecho

Landing completa, funcional, responsive y con Lighthouse > 85 en performance. Tag `v4-landing-ready` en remoto.
