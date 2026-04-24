# ACTION-034 — Vista de catálogo con layout y filtros propios

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-033 completada. `AssetCard` y `AssetCardList` implementados. `catalog.config.ts` define el layout por cliente.

## Objetivo

Crear `src/brand/components/Catalog/CatalogLayout.tsx` con control total sobre:

- El grid de resultados (columnas, gap, variante grid/lista)
- El toggle de layout (grid ↔ lista) si el cliente lo tiene activado
- Los filtros como componente propio (sidebar colapsable en desktop, drawer en mobile)
- Los chips de filtros activos con opción de eliminar cada uno

Este componente reemplaza el layout de la vista de búsqueda del core. Los datos (resultados, filtros disponibles, handlers de búsqueda) siguen viniendo del core — solo se reemplaza la presentación.

## Paso 1 — Auditar la vista de búsqueda del core

```bash
# Página de búsqueda
find src/pages -name "*.tsx" | xargs grep -l "search\|Search" | head -5
cat src/pages/search.tsx  # o el archivo encontrado

# Componentes de búsqueda
find src/components -name "*.tsx" | xargs grep -l "SearchResults\|AssetList\|ResultsList" | head -10
find src/components -name "*.tsx" | xargs grep -l "Filter\|Facet\|facet" | head -10
```

Anotar:

- Cómo se pasan los resultados al componente de grid (props, context, hook)
- Qué filtros existen y cuál es su estructura de datos
- Si hay paginación y cómo funciona (cursor, offset, página)
- Si el estado de filtros activos vive en URL (query params) o en estado local

La mayoría de implementaciones de OceanProtocol usan query params para los filtros, lo que es ideal para compartir URLs de búsqueda filtrada.

## Paso 2 — Extender `catalog.config.ts` con configuración de filtros

```typescript
// src/brand/config/catalog.config.ts — añadir:

export type FilterDisplayMode = 'sidebar' | 'topbar' | 'hidden'

export interface FilterConfig {
  displayMode: FilterDisplayMode // Dónde y cómo se muestran los filtros
  showFilterLabels: string[] // Qué filtros mostrar (vacío = todos los del core)
  hideFilterLabels: string[] // Qué filtros ocultar
  showActiveChips: boolean // Chips de filtros activos bajo la barra de búsqueda
  collapsibleOnDesktop: boolean // El sidebar se puede colapsar en desktop
  defaultCollapsed: boolean // Estado inicial del sidebar
}

// Añadir a CatalogConfig:
export interface CatalogConfig {
  card: AssetCardFieldConfig
  filters: FilterConfig // ← nuevo
  defaultLayout: 'grid' | 'list'
  allowLayoutToggle: boolean
  gridColumns: {
    desktop: 2 | 3 | 4
    tablet: 1 | 2
    mobile: 1
  }
}

// Valores por defecto:
const defaultCatalogConfig: CatalogConfig = {
  card: {
    /* ... existente */
  },
  filters: {
    displayMode: 'sidebar',
    showFilterLabels: [], // vacío = mostrar todos
    hideFilterLabels: [],
    showActiveChips: true,
    collapsibleOnDesktop: true,
    defaultCollapsed: false
  },
  defaultLayout: 'grid',
  allowLayoutToggle: true,
  gridColumns: { desktop: 3, tablet: 2, mobile: 1 }
}
```

## Paso 3 — Estructura de archivos a crear

```
src/brand/components/Catalog/
├── CatalogLayout.tsx         # Compositor principal
├── CatalogLayout.module.css
├── FilterSidebar.tsx         # Filtros en sidebar (desktop)
├── FilterSidebar.module.css
├── FilterDrawer.tsx          # Filtros en drawer (mobile)
├── FilterDrawer.module.css
├── ActiveFilters.tsx         # Chips de filtros activos
├── ActiveFilters.module.css
├── LayoutToggle.tsx          # Toggle grid / lista
└── LayoutToggle.module.css
```

## Paso 4 — Implementar `LayoutToggle`

```typescript
// src/brand/components/Catalog/LayoutToggle.tsx

import styles from './LayoutToggle.module.css'

interface LayoutToggleProps {
  value: 'grid' | 'list'
  onChange: (value: 'grid' | 'list') => void
}

export default function LayoutToggle({ value, onChange }: LayoutToggleProps) {
  return (
    <div className={styles.toggle} role="group" aria-label="Vista del catálogo">
      <button
        className={`${styles.btn} ${value === 'grid' ? styles.active : ''}`}
        onClick={() => onChange('grid')}
        aria-pressed={value === 'grid'}
        title="Vista en cuadrícula"
      >
        {/* Icono grid 2x2 como SVG inline */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      </button>
      <button
        className={`${styles.btn} ${value === 'list' ? styles.active : ''}`}
        onClick={() => onChange('list')}
        aria-pressed={value === 'list'}
        title="Vista en lista"
      >
        {/* Icono lista como SVG inline */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="2" width="14" height="2" rx="1" />
          <rect x="1" y="7" width="14" height="2" rx="1" />
          <rect x="1" y="12" width="14" height="2" rx="1" />
        </svg>
      </button>
    </div>
  )
}
```

```css
/* src/brand/components/Catalog/LayoutToggle.module.css */

.toggle {
  display: flex;
  border: var(--card-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-disabled);
  transition: var(--transition-colors);
}

.btn:not(:first-child) {
  border-left: var(--card-border);
}

.btn:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-secondary);
}

.btn.active {
  color: var(--color-action-primary);
  background-color: var(--color-action-primary-bg);
}
```

## Paso 5 — Implementar `ActiveFilters`

```typescript
// src/brand/components/Catalog/ActiveFilters.tsx

import styles from './ActiveFilters.module.css'

export interface ActiveFilter {
  key: string // Clave del filtro (ej: 'type', 'tag', 'price')
  label: string // Texto visible (ej: 'Dataset', 'ocean', 'Gratuito')
  onRemove: () => void
}

interface ActiveFiltersProps {
  filters: ActiveFilter[]
  onClearAll?: () => void
}

export default function ActiveFilters({
  filters,
  onClearAll
}: ActiveFiltersProps) {
  if (filters.length === 0) return null

  return (
    <div className={styles.container} role="list" aria-label="Filtros activos">
      {filters.map((filter) => (
        <div
          key={`${filter.key}-${filter.label}`}
          className={styles.chip}
          role="listitem"
        >
          <span className={styles.label}>{filter.label}</span>
          <button
            className={styles.remove}
            onClick={filter.onRemove}
            aria-label={`Eliminar filtro ${filter.label}`}
          >
            ✕
          </button>
        </div>
      ))}
      {onClearAll && filters.length > 1 && (
        <button className={styles.clearAll} onClick={onClearAll}>
          Limpiar todo
        </button>
      )}
    </div>
  )
}
```

```css
/* src/brand/components/Catalog/ActiveFilters.module.css */

.container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) 0;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2) var(--space-1) var(--space-3);
  background-color: var(--color-action-primary-bg);
  border: 1px solid color-mix(in srgb, var(--color-action-primary) 30%, transparent);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-action-primary);
}

.label {
  line-height: 1;
}

.remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: currentColor;
  opacity: 0.7;
  font-size: 10px;
  padding: 0;
  transition: opacity var(--transition-fast);
  border-radius: var(--radius-full);
}

.remove:hover {
  opacity: 1;
}

.clearAll {
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  text-decoration: underline;
  padding: var(--space-1);
}

.clearAll:hover {
  color: var(--color-text-primary);
}
```

## Paso 6 — Implementar `FilterSidebar`

```typescript
// src/brand/components/Catalog/FilterSidebar.tsx

import { useState } from 'react'
import type { FilterConfig } from '../../config/catalog.config'
import styles from './FilterSidebar.module.css'

// El tipo de los filtros disponibles viene del core
// Ajustar según la estructura real del proyecto
interface FilterOption {
  label: string
  value: string
  count?: number
}

interface FilterGroup {
  label: string
  key: string
  options: FilterOption[]
  type: 'checkbox' | 'radio' | 'range'
}

interface FilterSidebarProps {
  filterGroups: FilterGroup[]
  activeValues: Record<string, string[]>
  onFilterChange: (key: string, value: string, checked: boolean) => void
  config: FilterConfig
}

export default function FilterSidebar({
  filterGroups,
  activeValues,
  onFilterChange,
  config
}: FilterSidebarProps) {
  const [collapsed, setCollapsed] = useState(config.defaultCollapsed)
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({})

  const visibleGroups = filterGroups.filter((group) => {
    if (config.showFilterLabels.length > 0) {
      return config.showFilterLabels.includes(group.key)
    }
    return !config.hideFilterLabels.includes(group.key)
  })

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (config.displayMode === 'hidden') return null

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      aria-label="Filtros de búsqueda"
    >
      <div className={styles.header}>
        <span className={styles.title}>Filtros</span>
        {config.collapsibleOnDesktop && (
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expandir filtros' : 'Colapsar filtros'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        )}
      </div>

      {!collapsed && (
        <div className={styles.groups}>
          {visibleGroups.map((group) => (
            <div key={group.key} className={styles.group}>
              <button
                className={styles.groupHeader}
                onClick={() => toggleGroup(group.key)}
                aria-expanded={!collapsedGroups[group.key]}
              >
                <span className={styles.groupLabel}>{group.label}</span>
                <span className={styles.groupChevron}>
                  {collapsedGroups[group.key] ? '›' : '‹'}
                </span>
              </button>

              {!collapsedGroups[group.key] && (
                <div className={styles.options}>
                  {group.options.map((option) => {
                    const isActive =
                      activeValues[group.key]?.includes(option.value) ?? false
                    return (
                      <label key={option.value} className={styles.option}>
                        <input
                          type={group.type === 'radio' ? 'radio' : 'checkbox'}
                          name={group.key}
                          value={option.value}
                          checked={isActive}
                          onChange={(e) =>
                            onFilterChange(
                              group.key,
                              option.value,
                              e.target.checked
                            )
                          }
                          className={styles.input}
                        />
                        <span className={styles.optionLabel}>
                          {option.label}
                        </span>
                        {option.count !== undefined && (
                          <span className={styles.count}>{option.count}</span>
                        )}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}
```

```css
/* src/brand/components/Catalog/FilterSidebar.module.css */

.sidebar {
  width: 240px;
  flex-shrink: 0;
  border: var(--card-border);
  border-radius: var(--card-radius);
  background-color: var(--color-bg-primary);
  height: fit-content;
  position: sticky;
  top: calc(64px + var(--space-6)); /* Altura del header + spacing */
  transition: width var(--transition-base);
}

.sidebar.collapsed {
  width: 48px;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-4);
  border-bottom: var(--card-border);
}

.title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.collapseBtn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: var(--text-base);
  padding: var(--space-1);
  line-height: 1;
}

.groups {
  padding: var(--space-2) 0;
}

.group {
  border-bottom: var(--card-border);
}

.group:last-child {
  border-bottom: none;
}

.groupHeader {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.groupLabel {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.groupChevron {
  color: var(--color-text-disabled);
  font-size: var(--text-sm);
}

.options {
  padding: 0 var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.input {
  width: 14px;
  height: 14px;
  accent-color: var(--color-action-primary);
  flex-shrink: 0;
}

.optionLabel {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  flex: 1;
}

.count {
  font-size: var(--text-xs);
  color: var(--color-text-disabled);
}

@media (max-width: 768px) {
  .sidebar {
    display: none; /* En mobile se usa el drawer */
  }
}
```

## Paso 7 — Implementar `CatalogLayout` compositor

```typescript
// src/brand/components/Catalog/CatalogLayout.tsx

import { useState } from 'react'
import { getCatalogConfig } from '../../config/catalog.config'
import { AssetCard } from './AssetCard'
import { AssetCardList } from './AssetCardList'
import FilterSidebar from './FilterSidebar'
import ActiveFilters from './ActiveFilters'
import LayoutToggle from './LayoutToggle'
import styles from './CatalogLayout.module.css'

// Tipos del core — ajustar según el proyecto real
interface CatalogLayoutProps {
  assets: any[] // AssetExtended[] del core
  totalResults: number
  isLoading: boolean
  filterGroups: any[] // FilterGroup[] del core
  activeFilters: Record<string, string[]>
  onFilterChange: (key: string, value: string, checked: boolean) => void
  onClearFilters: () => void
  // Paginación u otros handlers del core
  children?: React.ReactNode // Slot para paginación del core
}

export default function CatalogLayout({
  assets,
  totalResults,
  isLoading,
  filterGroups,
  activeFilters,
  onFilterChange,
  onClearFilters,
  children
}: CatalogLayoutProps) {
  const config = getCatalogConfig()
  const [layout, setLayout] = useState<'grid' | 'list'>(config.defaultLayout)

  // Construir lista de filtros activos para los chips
  const activeFilterChips = Object.entries(activeFilters).flatMap(
    ([key, values]) =>
      values.map((value) => ({
        key,
        label: value,
        onRemove: () => onFilterChange(key, value, false)
      }))
  )

  const hasFilters = config.filters.displayMode !== 'hidden'

  return (
    <div className={styles.layout}>
      {/* Sidebar de filtros — solo desktop */}
      {hasFilters && config.filters.displayMode === 'sidebar' && (
        <FilterSidebar
          filterGroups={filterGroups}
          activeValues={activeFilters}
          onFilterChange={onFilterChange}
          config={config.filters}
        />
      )}

      {/* Área de resultados */}
      <div className={styles.results}>
        {/* Barra superior: total, filtros activos, toggle */}
        <div className={styles.toolbar}>
          <span className={styles.total}>
            {isLoading ? 'Buscando...' : `${totalResults} resultados`}
          </span>
          <div className={styles.toolbarActions}>
            {config.allowLayoutToggle && (
              <LayoutToggle value={layout} onChange={setLayout} />
            )}
          </div>
        </div>

        {/* Chips de filtros activos */}
        {config.filters.showActiveChips && activeFilterChips.length > 0 && (
          <ActiveFilters
            filters={activeFilterChips}
            onClearAll={onClearFilters}
          />
        )}

        {/* Grid de assets */}
        {isLoading ? (
          <div className={styles.loading}>
            {/* Skeleton loader */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : assets.length === 0 ? (
          <div className={styles.empty}>
            <p>No se encontraron resultados para esta búsqueda.</p>
            {activeFilterChips.length > 0 && (
              <button className={styles.clearBtn} onClick={onClearFilters}>
                Limpiar filtros
              </button>
            )}
          </div>
        ) : layout === 'grid' ? (
          <div
            className={styles.grid}
            style={
              {
                '--cols-desktop': config.gridColumns.desktop,
                '--cols-tablet': config.gridColumns.tablet
              } as React.CSSProperties
            }
          >
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} config={config.card} />
            ))}
          </div>
        ) : (
          <div className={styles.list}>
            {assets.map((asset) => (
              <AssetCardList
                key={asset.id}
                asset={asset}
                config={config.card}
              />
            ))}
          </div>
        )}

        {/* Slot de paginación del core */}
        {children}
      </div>
    </div>
  )
}
```

```css
/* src/brand/components/Catalog/CatalogLayout.module.css */

.layout {
  display: flex;
  gap: var(--space-8);
  align-items: flex-start;
}

.results {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-3);
  border-bottom: var(--card-border);
}

.total {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.toolbarActions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* Grid dinámico según config */
.grid {
  display: grid;
  grid-template-columns: repeat(var(--cols-desktop, 3), 1fr);
  gap: var(--space-5);
}

.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Skeleton loader */
.loading {
  display: grid;
  grid-template-columns: repeat(var(--cols-desktop, 3), 1fr);
  gap: var(--space-5);
}

.skeleton {
  height: 220px;
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 25%,
    var(--color-bg-primary) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--card-radius);
  border: var(--card-border);
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.empty {
  padding: var(--space-16) var(--space-8);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.clearBtn {
  background: none;
  border: var(--card-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  cursor: pointer;
  color: var(--color-text-primary);
  transition: var(--transition-colors);
}

.clearBtn:hover {
  border-color: var(--color-border-strong);
  background-color: var(--color-bg-secondary);
}

@media (max-width: 1024px) {
  .grid,
  .loading {
    grid-template-columns: repeat(var(--cols-tablet, 2), 1fr);
  }
}

@media (max-width: 640px) {
  .layout {
    flex-direction: column;
  }

  .grid,
  .loading {
    grid-template-columns: 1fr;
  }
}
```

## Paso 8 — Registrar en el resolver y conectar con la página

```typescript
// src/brand/resolver.ts — añadir:
export { default as BrandCatalogLayout } from './components/Catalog/CatalogLayout'
```

Localizar la página de búsqueda del core y conectar `BrandCatalogLayout`:

```bash
cat src/pages/search.tsx
```

La integración consistirá en reemplazar el componente de resultados del core por `BrandCatalogLayout`, pasando como props los datos y handlers que el core ya gestiona (resultados, filtros, paginación).

Si la integración requiere demasiados cambios en la página del core, crear una página brand en `src/pages/search.tsx` usando `getServerSideProps` o el mismo mecanismo que usa el core, y delegando la lógica de búsqueda a los hooks/utils del core.

## Verificación

```bash
npm run dev
# Navegar a /search
```

- [ ] Sidebar de filtros visible en desktop (240px de ancho)
- [ ] Sidebar sticky al hacer scroll
- [ ] Grupos de filtros colapsables
- [ ] Filtros activos muestran chips
- [ ] Chip de filtro se elimina al hacer clic en ✕
- [ ] Toggle grid/lista funciona
- [ ] Grid cambia según la config del cliente
- [ ] Skeleton loader visible durante la carga
- [ ] Estado vacío visible cuando no hay resultados
- [ ] En mobile (375px): sidebar oculta, layout en columna única

## Qué evitar

- No reimplementar la lógica de búsqueda ni el fetching de datos. Solo la presentación.
- No gestionar el estado de filtros en este componente si el core ya lo gestiona en la URL. Leer de la URL, no duplicar el estado.
- No hardcodear los nombres de los grupos de filtros. Vienen del core como props.

## Entregable

- `src/brand/components/Catalog/CatalogLayout.tsx` + CSS
- `src/brand/components/Catalog/FilterSidebar.tsx` + CSS
- `src/brand/components/Catalog/ActiveFilters.tsx` + CSS
- `src/brand/components/Catalog/LayoutToggle.tsx` + CSS
- `src/brand/resolver.ts` actualizado
- Vista de catálogo con layout corporativo completo

## Criterio de hecho

La vista de catálogo muestra sidebar de filtros, chips de filtros activos, toggle de layout y grid configurable. Todo funcional y responsive. `npm run build` sin errores.
