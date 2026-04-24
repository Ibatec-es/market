import type { DetailConfig } from '../../config/detail.config'
import styles from './ActionPanel.module.css'

interface ActionPanelProps {
  asset: any
  config: DetailConfig['actionPanel']
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
  const priceStat = asset.indexedMetadata?.stats?.[0]?.prices?.[0]
  const isFree = !priceStat || priceStat.price === '0'
  const priceValue = priceStat?.price
  const priceToken = asset.indexedMetadata?.stats?.[0]?.symbol
  const orders = asset.indexedMetadata?.stats?.[0]?.orders ?? 0
  const author = asset.indexedMetadata?.nft?.owner ?? ''

  return (
    <div
      className={`${styles.panel} ${
        config.position === 'sidebar' ? styles.sidebarPanel : ''
      }`}
    >
      <div className={styles.priceSection}>
        <div className={styles.price}>
          {isFree ? (
            <span className={styles.free}>Acceso gratuito</span>
          ) : (
            <>
              <span className={styles.priceValue}>{priceValue ?? '—'}</span>
              <span className={styles.priceToken}>{priceToken ?? ''}</span>
            </>
          )}
        </div>
        {config.showPriceBreakdown && !isFree && (
          <div className={styles.priceBreakdown}>
            <span className={styles.breakdownRow}>
              <span>Precio base</span>
              <span>{priceValue}</span>
            </span>
          </div>
        )}
      </div>

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

      {config.showAccessCount && (
        <div className={styles.stat}>
          <span className={styles.statValue}>{orders}</span>
          <span className={styles.statLabel}>accesos</span>
        </div>
      )}

      {config.showPublisher && author && (
        <div className={styles.publisher}>
          <span className={styles.publisherLabel}>Publicado por</span>
          <span className={styles.publisherAddress}>
            {`${author.slice(0, 8)}...${author.slice(-6)}`}
          </span>
        </div>
      )}
    </div>
  )
}
