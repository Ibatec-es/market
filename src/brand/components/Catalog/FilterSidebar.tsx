import { useState } from 'react'
import type { FilterConfig } from '../../config/catalog.config'
import styles from './FilterSidebar.module.css'

interface FilterOption {
  label: string
  value: string
  count?: number
}

interface FilterGroup {
  label: string
  key: string
  options: FilterOption[]
  type?: 'checkbox' | 'radio' | 'range'
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
