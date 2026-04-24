import Link from 'next/link'
import type { AssetCardFieldConfig } from '../../config/catalog.config'
import styles from './AssetCardList.module.css'

import type { AssetExtended } from '../../../@types/AssetExtended'

interface AssetCardListProps {
  asset: AssetExtended
  config: AssetCardFieldConfig
}

export default function AssetCardList({ asset, config }: AssetCardListProps) {
  const metadata = asset.credentialSubject?.metadata
  const isAlgorithm = metadata?.type === 'algorithm'

  const priceStat = asset.indexedMetadata?.stats?.[0]?.prices?.[0]
  const isFree = !priceStat || priceStat.price === '0'
  const priceValue = priceStat?.price
  const priceToken = asset.indexedMetadata?.stats?.[0]?.symbol

  return (
    <Link href={`/asset/${asset.id}`} className={styles.card}>
      {/* Meta */}
      <div className={styles.meta}>
        {config.showType && (
          <span
            className={`${styles.typeBadge} ${
              isAlgorithm ? styles.algorithm : styles.dataset
            }`}
          >
            {isAlgorithm ? 'Algoritmo' : 'Dataset'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.name}>{metadata?.name ?? 'Sin nombre'}</h3>
        {config.showDescription && metadata?.description && (
          <p className={styles.description}>
            {(metadata.description as any)?.['@value'] || metadata.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {config.showPrice && (
          <span className={`${styles.priceLabel} ${isFree ? styles.free : ''}`}>
            {isFree ? 'Gratuito' : `${priceValue ?? '—'} ${priceToken ?? ''}`}
          </span>
        )}
      </div>
    </Link>
  )
}
