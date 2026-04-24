export interface AssetCardFieldConfig {
  showType: boolean // Badge 'Dataset' / 'Algoritmo'
  showAuthor: boolean // Nombre del publicador
  showPrice: boolean // Precio o 'Gratuito'
  showOrders: boolean // Número de accesos/compras
  showTags: boolean // Tags de categoría (máx. 3)
  showDescription: boolean // Descripción truncada (2 líneas)
  showNetwork: boolean // Red blockchain donde está publicado
  maxTags: number // Cuántos tags mostrar en la card
  descriptionLines: number // Cuántas líneas de descripción
}

export type FilterDisplayMode = 'sidebar' | 'topbar' | 'hidden'

export interface FilterConfig {
  displayMode: FilterDisplayMode // Dónde y cómo se muestran los filtros
  showFilterLabels: string[] // Qué filtros mostrar (vacío = todos los del core)
  hideFilterLabels: string[] // Qué filtros ocultar
  showActiveChips: boolean // Chips de filtros activos bajo la barra de búsqueda
  collapsibleOnDesktop: boolean // El sidebar se puede colapsar en desktop
  defaultCollapsed: boolean // Estado inicial del sidebar
}

export interface CatalogConfig {
  card: AssetCardFieldConfig
  filters: FilterConfig
  defaultLayout: 'grid' | 'list'
  allowLayoutToggle: boolean // ¿Puede el usuario cambiar entre grid/lista?
  gridColumns: {
    desktop: 2 | 3 | 4
    tablet: 1 | 2
    mobile: 1
  }
}

// Configuración por defecto — sobrescribir por cliente si es necesario
const defaultCatalogConfig: CatalogConfig = {
  card: {
    showType: true,
    showAuthor: true,
    showPrice: true,
    showOrders: false,
    showTags: true,
    showDescription: true,
    showNetwork: false,
    maxTags: 3,
    descriptionLines: 2
  },
  filters: {
    displayMode: 'sidebar',
    showFilterLabels: [],
    hideFilterLabels: [],
    showActiveChips: true,
    collapsibleOnDesktop: true,
    defaultCollapsed: false
  },
  defaultLayout: 'grid',
  allowLayoutToggle: true,
  gridColumns: {
    desktop: 3,
    tablet: 2,
    mobile: 1
  }
}

// Overrides por cliente
const catalogConfigs: Record<string, Partial<CatalogConfig>> = {
  default: {},
  'demo-client': {
    card: {
      ...defaultCatalogConfig.card,
      showOrders: true,
      showNetwork: true,
      maxTags: 2
    },
    defaultLayout: 'list'
  }
}

export function getCatalogConfig(): CatalogConfig {
  const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || 'default'
  const override = catalogConfigs[BRAND_ID] ?? {}
  return {
    ...defaultCatalogConfig,
    ...override,
    card: { ...defaultCatalogConfig.card, ...(override.card ?? {}) },
    filters: { ...defaultCatalogConfig.filters, ...(override.filters ?? {}) },
    gridColumns: {
      ...defaultCatalogConfig.gridColumns,
      ...(override.gridColumns ?? {})
    }
  }
}
