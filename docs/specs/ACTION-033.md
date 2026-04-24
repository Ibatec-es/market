# ACTION-033 — Componente custom de Card de asset / algoritmo

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-028 completada. Sistema de tokens aplicado. Vistas del marketplace ajustadas con overrides CSS.

Esta acción inicia una extensión de la Fase 5 centrada en control estructural de las vistas del marketplace. No es solo override de estilos — es reemplazar el componente de card del core por uno propio con control total sobre composición, campos visibles y variantes de presentación.

## Objetivo

Crear `src/brand/components/Catalog/AssetCard.tsx` como componente propio que reemplaza la card de asset del core. Exponer un `BrandAssetCard` desde el resolver para que el core lo use en su grid de resultados.

La card corporativa tiene:

- Control explícito sobre qué campos se muestran y en qué orden
- Dos variantes de layout: `grid` (card compacta) y `list` (fila expandida)
- Diseño minimalista: borde, sin sombra, hover con elevación de borde
- Campos configurables por `BRAND_ID` (qué metadatos son relevantes para cada cliente)

## Paso 1 — Auditar la card del core

```bash
# Localizar el componente de card actual
find src/components -name "*.tsx" | xargs grep -l "AssetCard\|assetCard\|asset-card" | head -10
find src/components -name "*.tsx" | xargs grep -l "did\|DID\|datatoken\|Datatoken" | grep -i "card\|item\|tile" | head -10
```

Leer el componente encontrado y anotar:

- Qué props recibe (el tipo del objeto asset)
- Qué campos del asset renderiza actualmente
- Cómo gestiona la navegación al detalle (Link, router.push)
- Si tiene variantes o solo un layout

El tipo del asset en OceanProtocol suele tener esta forma:

```typescript
// Tipo aproximado — verificar el tipo real en el proyecto
interface Asset {
  id: string // DID del asset
  nft: {
    name: string
    description: string
    owner: string
  }
  metadata: {
    type: 'dataset' | 'algorithm'
    name: string
    description: string
    tags?: string[]
    author?: string
    license?: string
  }
  stats: {
    orders: number
  }
  price?: {
    value: string
    token: string
  }
  accessDetails?: {
    type: 'free' | 'paid'
    price: string
    addressOrId: string
    templateId: number
    isPurchased?: boolean
  }
}
```

Verificar el tipo real importando desde donde el core lo define:

```bash
grep -r "interface.*Asset\|type.*Asset" src/@types/ src/@utils/ src/@context/ --include="*.ts" --include="*.tsx" | head -10
```

## Paso 2 — Definir la configuración de campos por brand

Crear `src/brand/config/catalog.config.ts` para que cada cliente controle qué campos de la card son visibles:

```typescript
// src/brand/config/catalog.config.ts

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

export interface CatalogConfig {
  card: AssetCardFieldConfig
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
    gridColumns: {
      ...defaultCatalogConfig.gridColumns,
      ...(override.gridColumns ?? {})
    }
  }
}
```

## Paso 3 — Estructura de archivos a crear

```
src/brand/components/Catalog/
├── AssetCard.tsx
├── AssetCard.module.css
├── AssetCardList.tsx        # Variante layout lista
├── AssetCardList.module.css
└── index.ts                 # Re-exports
```

## Paso 4 — Implementar `AssetCard.module.css` (variante grid)

```css
/* src/brand/components/Catalog/AssetCard.module.css */

.card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
  border: var(--card-border);
  border-radius: var(--card-radius);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: border-color var(--transition-base);
  height: 100%;
}

.card:hover {
  border-color: var(--color-border-strong);
}

.card:focus-visible {
  outline: 2px solid var(--color-action-primary);
  outline-offset: 2px;
}

/* Cabecera de la card */
.header {
  padding: var(--space-4) var(--space-5) var(--space-3);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

/* Badge de tipo (Dataset / Algoritmo) */
.typeBadge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.typeBadge.dataset {
  background-color: var(--color-action-primary-bg);
  color: var(--color-action-primary);
}

.typeBadge.algorithm {
  background-color: color-mix(in srgb, var(--color-warning) 12%, transparent);
  color: var(--color-warning);
}

/* Indicador de precio en la cabecera */
.priceLabel {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
}

.priceLabel.free {
  color: var(--color-success);
}

/* Cuerpo de la card */
.body {
  padding: 0 var(--space-5) var(--space-4);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.name {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  /* Truncar a 2 líneas */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: var(--leading-tight);
}

.description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0;
  /* Truncar al número de líneas configurado */
  display: -webkit-box;
  -webkit-line-clamp: var(--description-lines, 2);
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.author {
  font-size: var(--text-xs);
  color: var(--color-text-disabled);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: auto;
  padding-top: var(--space-2);
}

.authorAddress {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

/* Tags */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-1);
}

.tag {
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-bg-secondary);
  border: var(--card-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

/* Footer de la card */
.footer {
  padding: var(--space-3) var(--space-5);
  border-top: var(--card-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.orders {
  font-size: var(--text-xs);
  color: var(--color-text-disabled);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.network {
  font-size: var(--text-xs);
  color: var(--color-text-disabled);
  font-family: var(--font-mono);
}
```

## Paso 5 — Implementar `AssetCard.tsx` (variante grid)

```typescript
// src/brand/components/Catalog/AssetCard.tsx

import Link from 'next/link'
import type { AssetCardFieldConfig } from '../../config/catalog.config'
import styles from './AssetCard.module.css'

// Importar el tipo real del asset desde el core
// Ajustar el path según el proyecto
import type { AssetExtended } from '../../../@types/index'

interface AssetCardProps {
  asset: AssetExtended
  config: AssetCardFieldConfig
}

function truncateAddress(address: string, chars = 6): string {
  if (!address || address.length < chars * 2) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export default function AssetCard({ asset, config }: AssetCardProps) {
  const { metadata, accessDetails, stats, id } = asset
  const isAlgorithm = metadata?.type === 'algorithm'
  const isFree = accessDetails?.type === 'free' || accessDetails?.price === '0'
  const tags = metadata?.tags?.slice(0, config.maxTags) ?? []
  const author = asset.nft?.owner ?? ''

  return (
    <Link
      href={`/asset/${id}`}
      className={styles.card}
      style={
        {
          '--description-lines': config.descriptionLines
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <div className={styles.header}>
        {config.showType && (
          <span
            className={`${styles.typeBadge} ${
              isAlgorithm ? styles.algorithm : styles.dataset
            }`}
          >
            {isAlgorithm ? 'Algoritmo' : 'Dataset'}
          </span>
        )}
        {config.showPrice && (
          <span className={`${styles.priceLabel} ${isFree ? styles.free : ''}`}>
            {isFree
              ? 'Gratuito'
              : `${accessDetails?.price ?? '—'} ${accessDetails?.token ?? ''}`}
          </span>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        <h3 className={styles.name}>{metadata?.name ?? 'Sin nombre'}</h3>

        {config.showDescription && metadata?.description && (
          <p className={styles.description}>{metadata.description}</p>
        )}

        {config.showTags && tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {config.showAuthor && author && (
          <div className={styles.author}>
            <span>Por</span>
            <span className={styles.authorAddress}>
              {truncateAddress(author)}
            </span>
          </div>
        )}
      </div>

      {/* Footer condicional */}
      {(config.showOrders || config.showNetwork) && (
        <div className={styles.footer}>
          {config.showOrders && (
            <span className={styles.orders}>{stats?.orders ?? 0} accesos</span>
          )}
          {config.showNetwork && (
            <span className={styles.network}>
              {/* Red desde el asset — ajustar según la estructura real */}
              {(asset as any)?.chainId ?? 'mainnet'}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}
```

## Paso 6 — Implementar `AssetCardList.tsx` (variante lista)

La variante lista muestra la misma información pero en formato fila horizontal: tipo y precio a la izquierda, nombre y descripción en el centro, acciones a la derecha.

```css
/* src/brand/components/Catalog/AssetCardList.module.css */

.card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-4) var(--space-5);
  background-color: var(--color-bg-primary);
  border: var(--card-border);
  border-radius: var(--card-radius);
  text-decoration: none;
  color: inherit;
  transition: border-color var(--transition-base);
}

.card:hover {
  border-color: var(--color-border-strong);
}

.meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 100px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0; /* Para que el truncado funcione */
}

.name {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

/* Reutilizar clases de badge y precio de AssetCard.module.css */
.typeBadge {
  /* mismo estilo que en AssetCard */
}
.priceLabel {
  /* mismo estilo que en AssetCard */
}

@media (max-width: 640px) {
  .card {
    grid-template-columns: 1fr;
  }
  .actions {
    justify-content: flex-start;
  }
}
```

```typescript
// src/brand/components/Catalog/AssetCardList.tsx
// Misma lógica que AssetCard pero con layout horizontal
// El JSX sigue la estructura meta | content | actions
// Implementar siguiendo el mismo patrón que AssetCard.tsx
```

## Paso 7 — Crear `index.ts` de re-exports

```typescript
// src/brand/components/Catalog/index.ts
export { default as AssetCard } from './AssetCard'
export { default as AssetCardList } from './AssetCardList'
export { getCatalogConfig } from '../../config/catalog.config'
```

## Paso 8 — Registrar en el resolver

```typescript
// src/brand/resolver.ts — añadir:
export { AssetCard as BrandAssetCard } from './components/Catalog'
export { AssetCardList as BrandAssetCardList } from './components/Catalog'
export { getCatalogConfig as getBrandCatalogConfig } from './components/Catalog'
```

## Paso 9 — Conectar con el core

Localizar dónde el core renderiza las cards en el grid de resultados:

```bash
grep -r "AssetCard\|assetCard" src/components/ --include="*.tsx" -l
```

Modificar ese componente (o crear un wrapper en `brand/`) para que use `BrandAssetCard`:

```typescript
// En el componente de grid del core — añadir import condicional
import { BrandAssetCard, getBrandCatalogConfig } from '../../brand/resolver'

// En el render:
const catalogConfig = getBrandCatalogConfig()
// <BrandAssetCard asset={asset} config={catalogConfig.card} />
```

Si modificar el componente de grid del core genera demasiado diff, crear un wrapper en `brand/components/Catalog/CardWrapper.tsx` que el core pueda usar sin cambios estructurales grandes.

## Verificación

```bash
npm run dev
# Navegar a /search
```

- [ ] Cards se renderizan con el nuevo componente
- [ ] Campos configurados en `catalog.config.ts` son visibles / ocultos correctamente
- [ ] Hover con borde elevado (sin sombra)
- [ ] Navegación al detalle funciona
- [ ] En `demo-client`: campos distintos visibles según su config
- [ ] Responsive: grid correcto en los 3 breakpoints

## Qué evitar

- No reimplementar la lógica de acceso a datos del asset. Solo la presentación.
- No hardcodear el número de columnas del grid en esta acción — eso va en ACTION-034.
- No importar el tipo `Asset` del core con un path frágil. Verificar la ruta exacta del tipo.

## Entregable

- `src/brand/config/catalog.config.ts`
- `src/brand/components/Catalog/AssetCard.tsx` + CSS
- `src/brand/components/Catalog/AssetCardList.tsx` + CSS
- `src/brand/resolver.ts` actualizado
- Cards corporativas visibles en el catálogo

## Criterio de hecho

Las cards del catálogo se renderizan con el componente brand. Los campos se controlan desde `catalog.config.ts`. Cambiar la config cambia los campos visibles sin tocar el componente. `npm run build` sin errores.
