# ACTION-014 — Verificación visual post-tokens

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-013 completada. Sistema de tokens completo (colores, tipografía, espaciado, radios).

Esta acción cierra la Fase 2. Es una acción de validación y documentación.

## Objetivo de esta acción

Validar que el sistema de tokens transforma correctamente la interfaz, identificar componentes que no responden a los tokens (valores hardcodeados en CSS modules) y documentar el estado visual para comparar con el baseline.

## Checklist de verificación

### 1. Build y lint

```bash
npm run build
npm run lint
npx tsc --noEmit
```

Sin errores. Los warnings son aceptables si son del core (no de archivos brand).

### 2. Verificación por pantalla

Para cada pantalla, verificar los cuatro ejes del sistema de tokens:

**Colores:**

- [ ] Home — colores corporativos en todos los elementos
- [ ] Catálogo — cards con borde correcto, sin sombras decorativas
- [ ] Detalle de asset — textos, botones y estados con colores correctos
- [ ] Formularios — inputs, labels, errores con colores correctos
- [ ] Footer — colores corporativos

**Tipografía:**

- [ ] Títulos H1, H2, H3 — fuente display
- [ ] Cuerpo de texto — fuente body
- [ ] Hashes, IDs, código — fuente mono
- [ ] Escala tipográfica coherente entre pantallas

**Espaciado:**

- [ ] Padding de página consistente
- [ ] Gaps entre cards en el catálogo
- [ ] Espaciado interno de los componentes

**Radios y sombras:**

- [ ] Botones con radio correcto
- [ ] Cards con borde en lugar de sombra
- [ ] Modales con radio correcto (verificar si hay modales)
- [ ] Dropdowns con sombra funcional correcta

### 3. Inventario de excepciones — valores hardcodeados

```bash
# Buscar colores literales en componentes del core que no responden a tokens
grep -r "#[0-9a-fA-F]\{3,6\}" src/components/ --include="*.css" -l
grep -r "box-shadow:[^v]" src/components/ --include="*.css" -l
grep -r "border-radius:[^v]" src/components/ --include="*.css" -l
```

Para cada archivo encontrado, anotar:

- El componente afectado
- El tipo de valor hardcodeado
- Severidad visual (muy visible / apenas visible)

Registrar en `docs/token-exceptions.md`:

````markdown
# Excepciones de tokens — valores hardcodeados en componentes del core

Estos componentes tienen valores CSS literales que no responden al sistema de tokens.
Se abordarán en la Fase 5 (Refinamiento) con fixes puntuales de CSS en brand/tokens/.

| Componente | Archivo                                | Propiedad     | Valor hardcodeado | Severidad |
| ---------- | -------------------------------------- | ------------- | ----------------- | --------- |
| SearchBar  | components/Search/SearchBar.module.css | border-radius | 20px              | Media     |
| ...        |                                        |               |                   |           |

## Estrategia de resolución

Para cada excepción, la solución en Fase 5 es sobreescribir el selector específico
en brand/tokens/base.css sin tocar el CSS module del core:

```css
/* Override puntual para SearchBar */
.searchBar {
  border-radius: var(--radius-md) !important;
}
```
````

Usar !important solo cuando sea el único mecanismo disponible (CSS modules tienen
alta especificidad y no siempre se pueden sobreescribir sin él).

````

### 4. Capturar screenshots de estado post-tokens

```bash
mkdir -p docs/screenshots/phase2-tokens
````

Capturar las mismas pantallas del baseline (ACTION-003): Home, Catálogo, Detalle, Formularios, Header y Footer, en desktop y mobile.

Crear `docs/screenshots/phase2-tokens/README.md`:

```markdown
# Screenshots — Post Fase 2 (tokens aplicados)

Fecha: [fecha]
Tag: pendiente (se crea al final de esta acción)

## Cambios visuales respecto al baseline

- Paleta de colores: [descripción del cambio]
- Tipografía: [descripción del cambio]
- Espaciado y radios: [descripción del cambio]

## Excepciones conocidas (documentadas en token-exceptions.md)

[Lista breve de los componentes que no responden completamente a los tokens]
```

### 5. Verificación en dark mode (si aplica)

Si el sistema soporta dark mode:

```bash
# En DevTools, activar "Emulate CSS prefers-color-scheme: dark"
```

Verificar que los tokens de color funcionan en ambos modos.

### 6. Verificación responsive

Redimensionar el navegador y verificar en:

- 375px — Mobile
- 768px — Tablet
- 1280px — Desktop
- 1440px — Desktop ancho

No debe haber rotura de layout en ningún breakpoint. Si la hay, anotar el componente y el breakpoint en `docs/token-exceptions.md`.

## Crear tag de cierre de fase

Si todos los checkboxes del checklist están marcados y las excepciones están documentadas:

```bash
git add .
git commit -m "feat: phase 2 complete — design tokens applied"
git tag v2-tokens-applied
git push origin main --tags
```

## Patrón a seguir

El objetivo de esta acción no es la perfección visual — es la documentación del estado real. Las excepciones son normales y esperadas. Lo importante es que estén inventariadas y priorizadas.

## Qué evitar

- No intentar arreglar las excepciones ahora. Se documentan y se abordan en Fase 5.
- No crear el tag si hay errores de TypeScript o de build.
- No saltarse la verificación en mobile. Los tokens pueden verse correctos en desktop y rotos en mobile.

## Entregable

- `docs/token-exceptions.md` con el inventario de valores hardcodeados.
- `docs/screenshots/phase2-tokens/` con capturas actualizadas.
- Tag `v2-tokens-applied` en el repositorio remoto.

## Criterio de hecho

Build limpio. Screenshots capturados. Excepciones documentadas. Tag `v2-tokens-applied` en remoto. La identidad visual corporativa es reconocible en todas las pantallas principales.
