import Link from 'next/link'
import type { AssetCardFieldConfig } from '../../config/catalog.config'
import styles from './AssetCard.module.css'

import type { AssetExtended } from '../../../@types/AssetExtended'

interface AssetCardProps {
  asset: AssetExtended
  config: AssetCardFieldConfig
}

function truncateAddress(address: string, chars = 6): string {
  if (!address || address.length < chars * 2) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export default function AssetCard({ asset, config }: AssetCardProps) {
  const metadata = asset.credentialSubject?.metadata
  const isAlgorithm = metadata?.type === 'algorithm'

  const priceStat = asset.indexedMetadata?.stats?.[0]?.prices?.[0]
  const isFree = !priceStat || priceStat.price === '0'
  const priceValue = priceStat?.price
  const priceToken = asset.indexedMetadata?.stats?.[0]?.symbol

  const tags = metadata?.tags?.slice(0, config.maxTags) ?? []
  const author = asset.indexedMetadata?.nft?.owner ?? ''
  const orders = asset.indexedMetadata?.stats?.[0]?.orders ?? 0

  return (
    <Link
      href={`/asset/${asset.id}`}
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
            {isFree ? 'Gratuito' : `${priceValue ?? '—'} ${priceToken ?? ''}`}
          </span>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        <h3 className={styles.name}>{metadata?.name ?? 'Sin nombre'}</h3>

        {config.showDescription && metadata?.description && (
          <p className={styles.description}>
            {(metadata.description as any)?.['@value'] || metadata.description}
          </p>
        )}

        {config.showTags && tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag: string) => (
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
            <span className={styles.orders}>{orders} accesos</span>
          )}
          {config.showNetwork && (
            <span className={styles.network}>
              {asset.credentialSubject?.chainId ?? 'mainnet'}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}
