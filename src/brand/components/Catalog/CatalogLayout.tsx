import { useState } from 'react'
import { getCatalogConfig } from '../../config/catalog.config'
import AssetCard from './AssetCard'
import AssetCardList from './AssetCardList'
import FilterSidebar from './FilterSidebar'
import ActiveFilters from './ActiveFilters'
import LayoutToggle from './LayoutToggle'
import styles from './CatalogLayout.module.css'

interface CatalogLayoutProps {
  assets: any[]
  totalResults: number
  isLoading: boolean
  filterGroups: any[]
  activeFilters: Record<string, string[]>
  onFilterChange: (key: string, value: string, checked: boolean) => void
  onClearFilters: () => void
  children?: React.ReactNode // Slot para paginación
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

  const activeFilterChips = Object.entries(activeFilters).flatMap(
    ([key, values]) =>
      values.map((value) => ({
        key,
        label: value,
        onRemove: () => onFilterChange(key, value, false)
      }))
  )

  const hasFilters =
    config.filters.displayMode !== 'hidden' && filterGroups.length > 0

  return (
    <div className={styles.layout}>
      {hasFilters && config.filters.displayMode === 'sidebar' && (
        <FilterSidebar
          filterGroups={filterGroups}
          activeValues={activeFilters}
          onFilterChange={onFilterChange}
          config={config.filters}
        />
      )}

      <div className={styles.results}>
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

        {config.filters.showActiveChips && activeFilterChips.length > 0 && (
          <ActiveFilters
            filters={activeFilterChips}
            onClearAll={onClearFilters}
          />
        )}

        {isLoading ? (
          <div className={styles.loading}>
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

        {children}
      </div>
    </div>
  )
}
