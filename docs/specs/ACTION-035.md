# ACTION-035 — Vista de detalle de asset / algoritmo

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-034 completada. CatalogLayout con filtros y toggle de layout implementados.

## Objetivo

Crear `src/brand/components/AssetDetail/` con control total sobre la estructura de la vista de detalle de un asset o algoritmo. La composición de secciones, el panel de acciones, la presentación de metadata y la navegación por pestañas son completamente configurables desde `brand/config/`.

La vista corporativa tiene:

- Panel lateral sticky con precio y acciones (en desktop), o bloque superior (en mobile)
- Secciones de contenido organizadas en tabs: Descripción, Metadata técnica, Muestras de datos
- Estructura diferenciada para datasets vs algoritmos
- Metadata técnica (DID, CID, hashes) en formato monospace legible
- Sección de "assets relacionados" si el cliente la activa

## Paso 1 — Auditar la vista de detalle del core

```bash
# Página de detalle
find src/pages -name "*.tsx" | xargs grep -l "\[did\]\|\[id\]\|asset" | grep -v "index\|search\|publish" | head -5

# Componentes del detalle
find src/components -name "*.tsx" | xargs grep -l "AssetContent\|AssetActions\|AssetDetails" | head -10
```

Leer los componentes encontrados y anotar:

- Qué objeto `asset` recibe y cuál es su tipo completo
- Cómo se gestiona la compra/acceso (hook, handler, contexto)
- Si hay tabs o secciones en el core o todo es un layout plano
- Qué datos técnicos se muestran (DID, datatokenAddress, chainId, etc.)
- Si hay acceso a muestras de datos (sample files)

## Paso 2 — Definir la configuración de detalle por brand

Crear `src/brand/config/detail.config.ts`:

```typescript
// src/brand/config/detail.config.ts

export type DetailTab =
  | 'description'
  | 'metadata'
  | 'samples'
  | 'algorithm-io'
  | 'history'

export interface DetailConfig {
  // Tabs disponibles y su orden
  tabs: DetailTab[]

  // Panel de acciones
  actionPanel: {
    position: 'sidebar' | 'top' // sidebar = sticky lateral, top = bloque superior
    showPriceBreakdown: boolean // Desglose del precio con fees
    showAccessCount: boolean // Número de accesos anteriores
    showPublisher: boolean // Info del publicador en el panel
  }

  // Metadata técnica
  technicalMetadata: {
    showDID: boolean
    showDatatokenAddress: boolean
    showChainId: boolean
    showCreatedDate: boolean
    showUpdatedDate: boolean
    showLicense: boolean
    // Solo para algoritmos:
    showDockerImage: boolean
    showAlgorithmLanguage: boolean
    showEntrypoint: boolean
  }

  // Sección de assets relacionados
  showRelatedAssets: boolean

  // Diferenciación visual dataset vs algoritmo
  differentiateTypes: boolean
}

const defaultDetailConfig: DetailConfig = {
  tabs: ['description', 'metadata', 'samples'],
  actionPanel: {
    position: 'sidebar',
    showPriceBreakdown: false,
    showAccessCount: true,
    showPublisher: true
  },
  technicalMetadata: {
    showDID: true,
    showDatatokenAddress: false,
    showChainId: true,
    showCreatedDate: true,
    showUpdatedDate: true,
    showLicense: true,
    showDockerImage: false,
    showAlgorithmLanguage: false,
    showEntrypoint: false
  },
  showRelatedAssets: false,
  differentiateTypes: true
}

// Para algoritmos, activar campos específicos
const algorithmDetailConfig: Partial<DetailConfig> = {
  tabs: ['description', 'algorithm-io', 'metadata'],
  technicalMetadata: {
    ...defaultDetailConfig.technicalMetadata,
    showDockerImage: true,
    showAlgorithmLanguage: true,
    showEntrypoint: true
  }
}

const detailConfigs: Record<string, Partial<DetailConfig>> = {
  default: {},
  'demo-client': {
    actionPanel: {
      position: 'top',
      showPriceBreakdown: true,
      showAccessCount: true,
      showPublisher: false
    },
    showRelatedAssets: true
  }
}

export function getDetailConfig(
  assetType?: 'dataset' | 'algorithm'
): DetailConfig {
  const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || 'default'
  const brandOverride = detailConfigs[BRAND_ID] ?? {}
  const typeOverride = assetType === 'algorithm' ? algorithmDetailConfig : {}

  return {
    ...defaultDetailConfig,
    ...typeOverride,
    ...brandOverride,
    actionPanel: {
      ...defaultDetailConfig.actionPanel,
      ...(typeOverride.actionPanel ?? {}),
      ...(brandOverride.actionPanel ?? {})
    },
    technicalMetadata: {
      ...defaultDetailConfig.technicalMetadata,
      ...(typeOverride.technicalMetadata ?? {}),
      ...(brandOverride.technicalMetadata ?? {})
    }
  }
}
```

## Paso 3 — Estructura de archivos a crear

```
src/brand/components/AssetDetail/
├── index.tsx                  # Compositor principal
├── AssetDetail.module.css
├── ActionPanel.tsx            # Panel de precio y acciones
├── ActionPanel.module.css
├── ContentTabs.tsx            # Sistema de tabs de contenido
├── ContentTabs.module.css
├── TabDescription.tsx         # Tab: descripción del asset
├── TabMetadata.tsx            # Tab: metadata técnica
├── TabSamples.tsx             # Tab: muestras de datos (datasets)
├── TabAlgorithmIO.tsx         # Tab: inputs/outputs del algoritmo
└── MetadataRow.tsx            # Componente atómico para fila de metadata
```

## Paso 4 — Implementar `MetadataRow` (componente atómico)

```typescript
// src/brand/components/AssetDetail/MetadataRow.tsx

import styles from './AssetDetail.module.css'

interface MetadataRowProps {
  label: string
  value: string | React.ReactNode
  mono?: boolean // Renderizar en fuente monospace
  copyable?: boolean // Mostrar botón de copiar
  truncate?: boolean // Truncar valor largo con tooltip
}

export default function MetadataRow({
  label,
  value,
  mono = false,
  copyable = false,
  truncate = false
}: MetadataRowProps) {
  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value)
    }
  }

  return (
    <div className={styles.metaRow}>
      <dt className={styles.metaLabel}>{label}</dt>
      <dd
        className={`${styles.metaValue} ${mono ? styles.mono : ''} ${
          truncate ? styles.truncate : ''
        }`}
      >
        {value}
        {copyable && typeof value === 'string' && (
          <button
            className={styles.copyBtn}
            onClick={handleCopy}
            aria-label={`Copiar ${label}`}
            title="Copiar al portapapeles"
          >
            ⎘
          </button>
        )}
      </dd>
    </div>
  )
}
```

## Paso 5 — Implementar `ActionPanel`

```typescript
// src/brand/components/AssetDetail/ActionPanel.tsx

import type { DetailConfig } from '../../config/detail.config'
import styles from './ActionPanel.module.css'

interface ActionPanelProps {
  asset: any // Tipo real del core
  config: DetailConfig['actionPanel']
  // Handlers del core — NO reimplementar la lógica de compra
  onBuy?: () => void
  onAccess?: () => void
  isLoading?: boolean
  isPurchased?: boolean
}

export default function ActionPanel({
  asset,
  config,
  onBuy,
  onAccess,
  isLoading,
  isPurchased
}: ActionPanelProps) {
  const { accessDetails, stats } = asset
  const isFree = accessDetails?.type === 'free' || accessDetails?.price === '0'

  return (
    <div className={styles.panel}>
      {/* Precio */}
      <div className={styles.priceSection}>
        <div className={styles.price}>
          {isFree ? (
            <span className={styles.free}>Acceso gratuito</span>
          ) : (
            <>
              <span className={styles.priceValue}>
                {accessDetails?.price ?? '—'}
              </span>
              <span className={styles.priceToken}>
                {accessDetails?.token ?? ''}
              </span>
            </>
          )}
        </div>
        {config.showPriceBreakdown && !isFree && (
          <div className={styles.priceBreakdown}>
            {/* Desglose de fees — leer del accessDetails del core */}
            <span className={styles.breakdownRow}>
              <span>Precio base</span>
              <span>{accessDetails?.price}</span>
            </span>
          </div>
        )}
      </div>

      {/* Botón de acción principal */}
      {isPurchased ? (
        <button
          className={styles.btnAccess}
          onClick={onAccess}
          disabled={isLoading}
        >
          {isLoading ? 'Cargando...' : 'Acceder a los datos'}
        </button>
      ) : (
        <button className={styles.btnBuy} onClick={onBuy} disabled={isLoading}>
          {isLoading
            ? 'Procesando...'
            : isFree
            ? 'Acceder gratis'
            : 'Comprar acceso'}
        </button>
      )}

      {/* Stats */}
      {config.showAccessCount && (
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats?.orders ?? 0}</span>
          <span className={styles.statLabel}>accesos</span>
        </div>
      )}

      {/* Publicador */}
      {config.showPublisher && asset.nft?.owner && (
        <div className={styles.publisher}>
          <span className={styles.publisherLabel}>Publicado por</span>
          <span className={styles.publisherAddress}>
            {`${asset.nft.owner.slice(0, 8)}...${asset.nft.owner.slice(-6)}`}
          </span>
        </div>
      )}
    </div>
  )
}
```

```css
/* src/brand/components/AssetDetail/ActionPanel.module.css */

.panel {
  border: var(--card-border);
  border-radius: var(--card-radius);
  padding: var(--space-6);
  background-color: var(--color-bg-primary);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Cuando está en sidebar */
.sidebarPanel {
  position: sticky;
  top: calc(64px + var(--space-6));
  width: 300px;
  flex-shrink: 0;
}

.priceSection {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.price {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.priceValue {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.priceToken {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.free {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-success);
}

.priceBreakdown {
  border-top: var(--card-border);
  padding-top: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.breakdownRow {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.btnBuy {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-action-primary);
  color: var(--color-action-primary-text);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.btnBuy:hover:not(:disabled) {
  background-color: var(--color-action-primary-hover);
}

.btnBuy:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btnAccess {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: var(--card-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-colors);
}

.btnAccess:hover:not(:disabled) {
  border-color: var(--color-border-strong);
  background-color: var(--color-bg-primary);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.statValue {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.publisher {
  border-top: var(--card-border);
  padding-top: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.publisherLabel {
  font-size: var(--text-xs);
  color: var(--color-text-disabled);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.publisherAddress {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}
```

## Paso 6 — Implementar `ContentTabs`

```typescript
// src/brand/components/AssetDetail/ContentTabs.tsx

import { useState } from 'react'
import type { DetailTab } from '../../config/detail.config'
import styles from './ContentTabs.module.css'

const TAB_LABELS: Record<DetailTab, string> = {
  description: 'Descripción',
  metadata: 'Metadata técnica',
  samples: 'Muestras',
  'algorithm-io': 'Entradas y salidas',
  history: 'Historial'
}

interface ContentTabsProps {
  tabs: DetailTab[]
  children: (activeTab: DetailTab) => React.ReactNode
}

export default function ContentTabs({ tabs, children }: ContentTabsProps) {
  const [active, setActive] = useState<DetailTab>(tabs[0])

  return (
    <div className={styles.container}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={active === tab}
            className={`${styles.tab} ${active === tab ? styles.active : ''}`}
            onClick={() => setActive(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>
      <div className={styles.panel} role="tabpanel">
        {children(active)}
      </div>
    </div>
  )
}
```

```css
/* src/brand/components/AssetDetail/ContentTabs.module.css */

.container {
  display: flex;
  flex-direction: column;
}

.tabList {
  display: flex;
  border-bottom: var(--card-border);
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.tabList::-webkit-scrollbar {
  display: none;
}

.tab {
  padding: var(--space-3) var(--space-5);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  white-space: nowrap;
  transition: var(--transition-colors);
}

.tab:hover {
  color: var(--color-text-primary);
}

.tab.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-action-primary);
  font-weight: var(--font-weight-semibold);
}

.panel {
  padding-top: var(--space-6);
}
```

## Paso 7 — Implementar el compositor principal `index.tsx`

```typescript
// src/brand/components/AssetDetail/index.tsx

import { getDetailConfig } from '../../config/detail.config'
import ActionPanel from './ActionPanel'
import ContentTabs from './ContentTabs'
import MetadataRow from './MetadataRow'
import styles from './AssetDetail.module.css'

interface AssetDetailProps {
  asset: any // Tipo real del core
  // Handlers del core — no reimplementar lógica de compra
  onBuy?: () => void
  onAccess?: () => void
  isLoading?: boolean
  isPurchased?: boolean
}

export default function AssetDetail({
  asset,
  onBuy,
  onAccess,
  isLoading,
  isPurchased
}: AssetDetailProps) {
  const assetType = asset?.metadata?.type
  const config = getDetailConfig(assetType)
  const isSidebarPanel = config.actionPanel.position === 'sidebar'

  return (
    <article
      className={`${styles.layout} ${isSidebarPanel ? styles.withSidebar : ''}`}
    >
      {/* Encabezado del asset */}
      <header className={styles.header}>
        <div className={styles.headerMeta}>
          {config.differentiateTypes && (
            <span
              className={`${styles.typeBadge} ${
                assetType === 'algorithm' ? styles.algorithm : styles.dataset
              }`}
            >
              {assetType === 'algorithm' ? 'Algoritmo' : 'Dataset'}
            </span>
          )}
        </div>
        <h1 className={styles.title}>
          {asset?.metadata?.name ?? 'Sin nombre'}
        </h1>
        {asset?.metadata?.author && (
          <p className={styles.subtitle}>
            por <span className={styles.author}>{asset.metadata.author}</span>
          </p>
        )}
      </header>

      {/* Panel de acción en top (mobile siempre, desktop si config lo pide) */}
      {!isSidebarPanel && (
        <div className={styles.actionTop}>
          <ActionPanel
            asset={asset}
            config={config.actionPanel}
            onBuy={onBuy}
            onAccess={onAccess}
            isLoading={isLoading}
            isPurchased={isPurchased}
          />
        </div>
      )}

      {/* Contenido principal + sidebar */}
      <div className={styles.body}>
        {/* Tabs de contenido */}
        <div className={styles.content}>
          <ContentTabs tabs={config.tabs}>
            {(activeTab) => (
              <>
                {/* Tab: Descripción */}
                {activeTab === 'description' && (
                  <div className={styles.description}>
                    <p>{asset?.metadata?.description ?? 'Sin descripción.'}</p>
                    {asset?.metadata?.tags &&
                      asset.metadata.tags.length > 0 && (
                        <div className={styles.tags}>
                          {asset.metadata.tags.map((tag: string) => (
                            <span key={tag} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                )}

                {/* Tab: Metadata técnica */}
                {activeTab === 'metadata' && (
                  <dl className={styles.metadataGrid}>
                    {config.technicalMetadata.showDID && (
                      <MetadataRow
                        label="DID"
                        value={asset?.id}
                        mono
                        copyable
                        truncate
                      />
                    )}
                    {config.technicalMetadata.showChainId && (
                      <MetadataRow
                        label="Red"
                        value={String(asset?.chainId ?? '—')}
                      />
                    )}
                    {config.technicalMetadata.showLicense &&
                      asset?.metadata?.license && (
                        <MetadataRow
                          label="Licencia"
                          value={asset.metadata.license}
                        />
                      )}
                    {config.technicalMetadata.showCreatedDate && (
                      <MetadataRow
                        label="Publicado"
                        value={
                          asset?.nft?.created
                            ? new Date(asset.nft.created).toLocaleDateString(
                                'es-ES'
                              )
                            : '—'
                        }
                      />
                    )}
                    {config.technicalMetadata.showUpdatedDate && (
                      <MetadataRow
                        label="Actualizado"
                        value={
                          asset?.nft?.updated
                            ? new Date(asset.nft.updated).toLocaleDateString(
                                'es-ES'
                              )
                            : '—'
                        }
                      />
                    )}
                    {/* Campos de algoritmo */}
                    {config.technicalMetadata.showDockerImage && (
                      <MetadataRow
                        label="Imagen Docker"
                        value={
                          asset?.metadata?.algorithm?.container?.image ?? '—'
                        }
                        mono
                      />
                    )}
                    {config.technicalMetadata.showAlgorithmLanguage && (
                      <MetadataRow
                        label="Lenguaje"
                        value={asset?.metadata?.algorithm?.language ?? '—'}
                      />
                    )}
                    {config.technicalMetadata.showEntrypoint && (
                      <MetadataRow
                        label="Entrypoint"
                        value={
                          asset?.metadata?.algorithm?.container?.entrypoint ??
                          '—'
                        }
                        mono
                      />
                    )}
                  </dl>
                )}

                {/* Tab: Muestras (datasets) */}
                {activeTab === 'samples' && (
                  <div className={styles.samples}>
                    {/* Los sample files vienen del core — ajustar según estructura real */}
                    <p className={styles.samplesEmpty}>
                      No hay muestras disponibles para este asset.
                    </p>
                  </div>
                )}

                {/* Tab: Algorithm I/O */}
                {activeTab === 'algorithm-io' && (
                  <div className={styles.algorithmIO}>
                    {/* Inputs/outputs del algoritmo — ajustar según estructura del core */}
                    <p className={styles.samplesEmpty}>
                      Información de entradas y salidas del algoritmo.
                    </p>
                  </div>
                )}
              </>
            )}
          </ContentTabs>
        </div>

        {/* Panel de acción en sidebar */}
        {isSidebarPanel && (
          <aside className={styles.sidebar}>
            <ActionPanel
              asset={asset}
              config={config.actionPanel}
              onBuy={onBuy}
              onAccess={onAccess}
              isLoading={isLoading}
              isPurchased={isPurchased}
            />
          </aside>
        )}
      </div>
    </article>
  )
}
```

```css
/* src/brand/components/AssetDetail/AssetDetail.module.css */

/* Layout base */
.layout {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--space-8) var(--container-pad);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Header */
.header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.headerMeta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.typeBadge {
  display: inline-flex;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.typeBadge.dataset {
  background-color: var(--color-action-primary-bg);
  color: var(--color-action-primary);
}

.typeBadge.algorithm {
  background-color: color-mix(in srgb, var(--color-warning) 12%, transparent);
  color: var(--color-warning);
}

.title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  margin: 0;
}

.subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.author {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

/* Action panel en top */
.actionTop {
  max-width: 480px;
}

/* Body con sidebar */
.body {
  display: flex;
  gap: var(--space-10);
  align-items: flex-start;
}

.content {
  flex: 1;
  min-width: 0;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
}

/* Tab: Descripción */
.description {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  line-height: var(--leading-relaxed);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag {
  padding: var(--space-1) var(--space-3);
  background-color: var(--color-bg-secondary);
  border: var(--card-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

/* Tab: Metadata técnica */
.metadataGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  border: var(--card-border);
  border-radius: var(--card-radius);
  overflow: hidden;
  margin: 0;
}

.metaRow {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--card-border);
  align-items: start;
}

.metaRow:last-child {
  border-bottom: none;
}

.metaLabel {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background-color: var(--color-bg-secondary);
  margin: calc(-1 * var(--space-3)) calc(-1 * var(--space-4));
  padding: var(--space-3) var(--space-4);
  align-self: stretch;
  display: flex;
  align-items: center;
}

.metaValue {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  word-break: break-all;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
}

.metaValue.mono {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.metaValue.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copyBtn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-disabled);
  font-size: var(--text-base);
  padding: 0;
  flex-shrink: 0;
  transition: color var(--transition-fast);
}

.copyBtn:hover {
  color: var(--color-action-primary);
}

/* Tab: Muestras y Algorithm I/O */
.samples,
.algorithmIO {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.samplesEmpty {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-style: italic;
}

/* Mobile */
@media (max-width: 768px) {
  .body {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    order: -1; /* Panel de acción antes del contenido en mobile */
  }

  .title {
    font-size: var(--text-2xl);
  }

  .metaRow {
    grid-template-columns: 1fr;
    gap: var(--space-1);
  }

  .metaLabel {
    margin: calc(-1 * var(--space-3)) calc(-1 * var(--space-4)) 0;
    padding: var(--space-2) var(--space-4);
    align-self: auto;
  }
}
```

## Paso 8 — Registrar en el resolver y conectar con la página

```typescript
// src/brand/resolver.ts — añadir:
export { default as BrandAssetDetail } from './components/AssetDetail'
```

Localizar la página de detalle del core y conectar:

```bash
find src/pages -name "*.tsx" | xargs grep -l "\[did\]\|\[id\]" | grep -v "search\|publish" | head -3
```

En la página encontrada, localizar dónde se renderizan los componentes de detalle y reemplazarlos por `BrandAssetDetail`, pasando el objeto `asset` y los handlers de compra/acceso del core.

## Verificación

```bash
npm run dev
# Navegar a un asset real
```

- [ ] Título y metadata del header correctos
- [ ] Badge de tipo (Dataset / Algoritmo)
- [ ] Panel de acciones con precio, botón de compra/acceso
- [ ] Panel sticky en desktop al hacer scroll
- [ ] Tabs de contenido navegables con teclado
- [ ] Tab Descripción: texto y tags
- [ ] Tab Metadata: tabla con label/valor, DID con botón de copiar
- [ ] Valores de DID y hashes en fuente monospace
- [ ] En mobile: sidebar pasa a bloque superior, tabs scrollables
- [ ] Funcionalidad de compra/acceso intacta

Verificar con un asset de tipo algoritmo:

- [ ] Badge "Algoritmo" visible
- [ ] Tab "Entradas y salidas" en lugar de "Muestras"
- [ ] Campos Docker, lenguaje y entrypoint en la metadata

Verificar con `demo-client`:

- [ ] Panel de acción en modo `top` (no sidebar)
- [ ] Desglose de precio visible

## Qué evitar

- No reimplementar los handlers de compra, acceso o compute. Vienen del core como props y se pasan al `ActionPanel` sin modificación.
- No cambiar el routing ni las URLs de detalle. La navegación al detalle sigue siendo responsabilidad del core.
- No duplicar el estado de "isPurchased". Leerlo del core, no gestionarlo en el componente brand.

## Entregable

- `src/brand/components/AssetDetail/` con todos los subcomponentes implementados.
- `src/brand/config/detail.config.ts` con configuración por tipo de asset y por cliente.
- `src/brand/resolver.ts` actualizado con `BrandAssetDetail`.
- Vista de detalle corporativa con tabs, panel de acciones y metadata técnica.

## Criterio de hecho

El detalle de asset y de algoritmo se renderizan con el componente brand. Los tabs funcionan. El panel de acciones es correcto según la config del cliente. La metadata técnica está en formato tabular con monospace para hashes. La funcionalidad de compra no está rota. `npm run build` sin errores.
