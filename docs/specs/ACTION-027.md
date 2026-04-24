# ACTION-027 — Ajustar formularios y flujo de publicación

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-026 completada. Vista de detalle ajustada.

## Objetivo

Revisar y ajustar todos los formularios del proyecto (publicación de asset, configuración, cualquier formulario de entrada de datos) para que sean coherentes con el sistema de diseño. Prioridad especial en accesibilidad: labels visibles, estados de error claros, focus rings correctos.

## Paso 1 — Inventario de formularios

```bash
# Localizar todos los componentes de formulario
find src/components -name "*.tsx" | xargs grep -l "input\|Input\|textarea\|Textarea\|select\|Select\|form\|Form" | grep -v ".test." | head -20

# Localizar la página de publicación
find src/pages -name "*.tsx" | xargs grep -l "publish\|Publish\|create\|Create"
```

Navegar a `/publish` y documentar todos los campos del formulario:

| Campo              | Tipo         | Componente probable | Estado a verificar              |
| ------------------ | ------------ | ------------------- | ------------------------------- |
| Nombre del asset   | text input   | `Input`             | default, focus, error, disabled |
| Descripción        | textarea     | `Textarea`          | default, focus, error           |
| Precio             | number input | `Input`             | default, focus, error           |
| Tipo de acceso     | select/radio | `Select`            | default, focus                  |
| Tags               | multi-input  | `TagInput`          | default, focus, con valores     |
| Subida de archivos | file upload  | `FileInput`         | default, hover, con archivo     |

## Paso 2 — Auditar los componentes de input

```bash
find src/components -path "*/@shared*" -name "*.module.css" | xargs grep -l "input\|Input" 2>/dev/null
find src/components -path "*/atoms*" -name "*.module.css" | xargs grep -l "input\|border\|radius" 2>/dev/null
```

Verificar en DevTools para cada tipo de input:

- ¿El borde usa token o valor literal?
- ¿El radio de borde usa token o valor literal?
- ¿El color de fondo usa token?
- ¿El focus ring es visible y usa el color correcto?
- ¿El estado de error muestra el color `--color-error`?
- ¿El estado disabled usa `--color-text-disabled`?

## Paso 3 — Overrides de inputs en `brand/tokens/base.css`

```css
/* ============================================================
   FORMULARIOS E INPUTS
   ============================================================ */

/* --- Input base --- */
[class*='input'],
[class*='Input'],
input[type='text'],
input[type='number'],
input[type='email'],
input[type='url'],
input[type='password'],
textarea,
select {
  border-radius: var(--radius-md) !important;
  border: 1px solid var(--color-border) !important;
  background-color: var(--color-bg-primary) !important;
  color: var(--color-text-primary) !important;
  font-family: var(--font-body) !important;
  font-size: var(--text-sm) !important;
  height: 40px;
  padding: 0 var(--space-3) !important;
  transition: border-color var(--transition-base) !important;
}

textarea {
  height: auto !important;
  padding: var(--space-3) !important;
  resize: vertical;
}

/* Focus state — visible y con offset */
input:focus,
textarea:focus,
select:focus,
[class*='input']:focus,
[class*='Input']:focus {
  outline: 2px solid var(--color-action-primary) !important;
  outline-offset: 2px !important;
  border-color: var(--color-action-primary) !important;
  box-shadow: none !important;
}

/* Error state */
[class*='error'] input,
[class*='Error'] input,
input[aria-invalid='true'],
textarea[aria-invalid='true'] {
  border-color: var(--color-error) !important;
}

[class*='errorMessage'],
[class*='fieldError'],
[class*='error-message'] {
  color: var(--color-error) !important;
  font-size: var(--text-xs) !important;
  margin-top: var(--space-1) !important;
}

/* Disabled state */
input:disabled,
textarea:disabled,
select:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
  background-color: var(--color-bg-secondary) !important;
}

/* Placeholder */
input::placeholder,
textarea::placeholder {
  color: var(--color-text-disabled) !important;
}

/* --- Labels --- */
/* Los labels deben ser siempre visibles, nunca como placeholder sustituto */
[class*='label'],
[class*='Label'],
label {
  font-size: var(--text-sm) !important;
  font-weight: var(--font-weight-medium) !important;
  color: var(--color-text-primary) !important;
  margin-bottom: var(--space-1) !important;
  display: block !important;
}

/* --- Select --- */
select {
  appearance: none !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: right var(--space-3) center !important;
  padding-right: var(--space-8) !important;
}

/* --- Grupos de campo --- */
[class*='fieldGroup'],
[class*='formGroup'],
[class*='field-group'] {
  display: flex !important;
  flex-direction: column !important;
  gap: var(--space-2) !important;
  margin-bottom: var(--space-5) !important;
}

/* --- File upload --- */
[class*='fileUpload'],
[class*='FileUpload'],
[class*='dropzone'],
[class*='Dropzone'] {
  border: 2px dashed var(--color-border) !important;
  border-radius: var(--card-radius) !important;
  background-color: var(--color-bg-secondary) !important;
  transition: border-color var(--transition-base) !important;
}

[class*='fileUpload']:hover,
[class*='dropzone']:hover {
  border-color: var(--color-action-primary) !important;
  background-color: var(--color-action-primary-bg) !important;
}

/* --- Pasos del formulario multi-paso (stepper) --- */
[class*='stepper'],
[class*='Stepper'],
[class*='steps'] {
  gap: var(--space-4) !important;
}

[class*='step'][class*='active'],
[class*='Step'][class*='active'] {
  color: var(--color-action-primary) !important;
}

[class*='step'][class*='completed'],
[class*='Step'][class*='completed'] {
  color: var(--color-success) !important;
}
```

## Paso 4 — Verificar accesibilidad de formularios

Este es el punto donde más problemas de accesibilidad suelen aparecer:

**Labels:**

```bash
# Verificar que todos los inputs tienen label asociado
# En DevTools → Accessibility → verificar que no hay inputs sin label
```

Si el core usa `placeholder` como sustituto de `label`, no se puede corregir sin modificar el componente. Documentar como excepción de accesibilidad en `docs/token-exceptions.md`.

**Focus visible:**
En DevTools, usar Tab para navegar por el formulario. Verificar que el focus ring es visible en todos los campos.

**Anuncio de errores:**
Los mensajes de error deben tener `role="alert"` o estar asociados al input via `aria-describedby`. Esto no se puede corregir con CSS — documentar si no es el caso.

## Paso 5 — Verificar el flujo completo de publicación

Navegar el formulario completo de publicación:

- [ ] Paso 1: metadatos del asset (nombre, descripción, tags)
- [ ] Paso 2: configuración de acceso y precio
- [ ] Paso 3: subida de archivos o URLs
- [ ] Confirmación y submit

Verificar que en cada paso:

- Los inputs tienen el estilo del sistema
- Los errores de validación se muestran con el color correcto
- Los botones de siguiente/anterior tienen el estilo correcto
- El stepper de progreso usa los colores del sistema

## Qué evitar

- No cambiar el comportamiento de validación. Solo estilos.
- No eliminar el `outline` en focus para simplificar el estilo. La accesibilidad de teclado es no negociable.
- No usar `color: inherit` como atajo. Siempre referenciar el token correcto.

## Entregable

- `src/brand/tokens/base.css` con overrides de formularios aplicados.
- `docs/token-exceptions.md` actualizado con excepciones de formularios.
- Formularios visualmente coherentes con el sistema de diseño.

## Criterio de hecho

Todos los inputs, labels y mensajes de error son coherentes con el sistema de diseño. El focus ring es visible en todos los campos. El flujo de publicación funciona. `npm run build` sin errores.
