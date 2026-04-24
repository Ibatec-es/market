# Excepciones de tokens — valores hardcodeados en componentes del core

Estos componentes tienen valores CSS literales que no responden al sistema de tokens.
Se abordarán en la Fase 5 (Refinamiento) con fixes puntuales de CSS en `brand/tokens/`.

| Componente       | Archivo                                                        | Propiedad       | Valor hardcodeado                   | Severidad |
| ---------------- | -------------------------------------------------------------- | --------------- | ----------------------------------- | --------- |
| Header/SearchBar | `components/Header/SearchBar.module.css`                       | `background`    | `#fdd655`                           | Media     |
| Header/Menu      | `components/Header/Menu.module.css`                            | `color`         | `#0a4b70`                           | Alta      |
| Header/Wallet    | `components/Header/Wallet/Details.module.css`                  | `color`         | `#0a4b70`                           | Alta      |
| Header/Menu      | `components/Header/Menu.module.css`                            | `box-shadow`    | `1px 2px 8px var(--black-alpha-15)` | Baja      |
| ComputeWizard    | `components/ComputeWizard/UserParametersStep/index.module.css` | `box-shadow`    | `var(--shadow-md)`                  | Baja      |
| Header/Menu      | `components/Header/Menu.module.css`                            | `border-radius` | `50px`                              | Media     |
| ComputeWizard    | `components/ComputeWizard/Review/index.module.css`             | `border-radius` | `12px`                              | Baja      |
| ComputeWizard    | `components/ComputeWizard/SelectPrimaryAsset/index.module.css` | `border-radius` | `0.75rem`                           | Baja      |

> **Nota:** Existen cientos de ocurrencias de colores, sombras y radios hardcodeados (más de 400 colores, 240 sombras y 360 border-radius) en los módulos CSS. La tabla anterior solo muestra algunos ejemplos representativos de los componentes afectados.

## Estrategia de resolución

Para cada excepción, la solución en Fase 5 es sobreescribir el selector específico
en `brand/tokens/base.css` o archivos de override dedicados, sin tocar el CSS module del core:

```css
/* Override puntual para SearchBar */
.searchBar {
  background: var(--brand-primary) !important;
  border-radius: var(--radius-md) !important;
}
```

Usar `!important` solo cuando sea el único mecanismo disponible (CSS modules tienen
alta especificidad y no siempre se pueden sobreescribir sin él).
