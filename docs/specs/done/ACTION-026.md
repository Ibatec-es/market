# ACTION-026 — Ajustar vista de detalle de asset

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-025 completada. Vista de catálogo ajustada.

## Objetivo

Revisar la vista de detalle de un asset individual e identificar y corregir los elementos que no responden al sistema de tokens. Mantener toda la funcionalidad intacta (precio, compra, acceso, metadata).

## Paso 1 — Localizar los componentes del detalle

```bash
# Encontrar la página de detalle
find src/pages -name "*.tsx" | xargs grep -l "asset\|Asset\|\[did\]\|\[id\]"

# Encontrar los componentes que renderiza
find src/components -name "*.tsx" | xargs grep -l "AssetContent\|AssetActions\|AssetMetadata\|asset-detail" | head -15
```

Navegar a la URL de un asset real (o de prueba) e inspeccionar la estructura con DevTools.

La vista de detalle típica de un marketplace OceanProtocol tiene estas áreas:

| Área                            | Componente probable | Qué revisar              |
| ------------------------------- | ------------------- | ------------------------ |
| Título y descripción del asset  | `AssetContent`      | Tipografía, espaciado    |
| Panel de precio y acciones      | `AssetActions`      | Botones, colores, radios |
| Metadata / propiedades técnicas | `AssetMetadata`     | Tabla o lista, bordes    |
| Tags y categorías               | Tags/Chips          | Radio, color de fondo    |
| Información del proveedor       | `Publisher`         | Avatar, tipografía       |
| Sección de archivos/datos       | `AssetFiles`        | Lista, iconos            |

## Paso 2 — Identificar valores hardcodeados

Para cada área, abrir DevTools y buscar:

```bash
# Buscar todos los CSS modules de la vista de detalle
find src/components -path "*/Asset*" -name "*.module.css"
find src/components -path "*/asset*" -name "*.module.css"
```

Para cada archivo encontrado, buscar valores literales:

```bash
grep -n "#[0-9a-fA-F]\{3,6\}\|box-shadow:[^v]\|border-radius:[^v]" \
  src/components/[AssetComponent]/[file].module.css
```

## Paso 3 — Aplicar overrides en `brand/tokens/base.css`

Añadir una sección para los componentes del detalle de asset. Patrón de overrides:

```css
/* ============================================================
   VISTA DE DETALLE DE ASSET
   ============================================================ */

/* --- Panel de acciones (precio, botón de compra) --- */
[class*='assetActions'],
[class*='AssetActions'] {
  border: var(--card-border) !important;
  border-radius: var(--card-radius) !important;
  box-shadow: none !important;
  background-color: var(--color-bg-primary) !important;
}

/* --- Botón de acceso/compra principal --- */
/* Importante: no cambiar el comportamiento del botón, solo el estilo */
[class*='buyButton'],
[class*='BuyButton'],
[class*='accessButton'] {
  border-radius: var(--radius-md) !important;
  font-weight: var(--font-weight-semibold) !important;
}

/* --- Tags y chips de metadata --- */
[class*='tag'],
[class*='Tag'],
[class*='chip'],
[class*='Chip'] {
  border-radius: var(--radius-sm) !important;
  font-size: var(--text-xs) !important;
  font-weight: var(--font-weight-medium) !important;
}

/* --- Tabla o lista de propiedades técnicas --- */
[class*='metadataTable'],
[class*='MetadataTable'],
[class*='properties'] {
  border: var(--card-border) !important;
  border-radius: var(--card-radius) !important;
}

[class*='metadataTable'] th,
[class*='MetadataTable'] th {
  background-color: var(--color-bg-secondary) !important;
  color: var(--color-text-secondary) !important;
  font-size: var(--text-xs) !important;
  font-weight: var(--font-weight-semibold) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}

/* --- Datos en formato monospace (hashes, DIDs, CIDs) --- */
[class*='did'],
[class*='DID'],
[class*='hash'],
[class*='cid'],
code {
  font-family: var(--font-mono) !important;
  font-size: var(--text-xs) !important;
  background-color: var(--color-bg-secondary) !important;
  border: var(--card-border) !important;
  border-radius: var(--radius-sm) !important;
  padding: var(--space-1) var(--space-2) !important;
}
```

> **Nota sobre los hashes y DIDs:** La vista de detalle de un marketplace de datos muestra frecuentemente identificadores técnicos (DID, CID, hashes de transacción). Estos deben usar la fuente monospace del sistema. Verificar en DevTools qué selectores afectan a estos elementos y ajustar los selectores del override.

## Paso 4 — Verificar la jerarquía tipográfica

La vista de detalle tiene una jerarquía de información compleja. Verificar:

- El nombre del asset → H1 con `font-display`, tamaño `text-2xl` o `text-3xl`
- La descripción → cuerpo con `font-body`, tamaño `text-base`, color `text-secondary`
- Las labels de metadata → `text-xs`, `font-weight-semibold`, `text-secondary`, mayúsculas
- Los valores de metadata → `text-sm`, `font-body` o `font-mono` según el tipo de dato

Si la jerarquía no está bien definida por los tokens globales, añadir overrides específicos.

## Paso 5 — Verificar estados del asset

La vista de detalle puede tener estados diferentes según el estado del asset:

- Asset disponible → botón de compra activo
- Asset ya comprado → botón de acceso a datos
- Asset no disponible → botón desactivado
- Asset en proceso de compra → estado loading

Verificar que todos estos estados usan colores del sistema (`--color-action-primary`, `--color-error`, `--color-text-disabled`, etc.).

## Paso 6 — Verificación visual

```bash
npm run dev
# Navegar a un asset real
```

Comparar con `docs/screenshots/baseline/03-asset-detail-*.png`.

Criterios:

- [ ] Panel de precio/acciones con borde y sin sombra
- [ ] Botón principal con radio y color corporativo
- [ ] Tags con radio correcto
- [ ] Hashes y DIDs en monospace
- [ ] Tabla de metadata con estilo corporativo
- [ ] Jerarquía tipográfica correcta
- [ ] Funcionalidad de compra/acceso intacta

## Qué evitar

- No interferir con la lógica de transacciones. Los overrides solo afectan a propiedades visuales (colores, radios, sombras, tipografía).
- No cambiar el layout de la vista. Solo estilos.
- Verificar en DevTools que los selectores afectan solo a los elementos deseados y no a elementos de otras páginas.

## Entregable

- `docs/token-exceptions.md` actualizado con los componentes de la vista de detalle.
- `src/brand/tokens/base.css` con los overrides del detalle de asset.
- Vista de detalle visualmente coherente con el sistema.

## Criterio de hecho

La vista de detalle se ve corporativa y coherente con el catálogo. Funcionalidad de compra/acceso intacta. `npm run build` sin errores.
