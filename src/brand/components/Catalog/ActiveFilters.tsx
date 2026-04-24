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
