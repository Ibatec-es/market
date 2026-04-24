import { getDetailConfig } from '../../config/detail.config'
import ActionPanel from './ActionPanel'
import ContentTabs from './ContentTabs'
import MetadataRow from './MetadataRow'
import styles from './AssetDetail.module.css'

interface AssetDetailProps {
  asset: any
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

      <div className={styles.body}>
        <div className={styles.content}>
          <ContentTabs tabs={config.tabs}>
            {(activeTab) => (
              <>
                {activeTab === 'description' && (
                  <div className={styles.description}>
                    <p>
                      {(asset?.metadata?.description as any)?.['@value'] ||
                        asset?.metadata?.description ||
                        'Sin descripción.'}
                    </p>
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
                        value={String(asset?.credentialSubject?.chainId ?? '—')}
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
                          asset?.indexedMetadata?.nft?.created
                            ? new Date(
                                asset.indexedMetadata.nft.created
                              ).toLocaleDateString('es-ES')
                            : '—'
                        }
                      />
                    )}
                    {config.technicalMetadata.showUpdatedDate && (
                      <MetadataRow
                        label="Actualizado"
                        value={
                          asset?.indexedMetadata?.nft?.updated
                            ? new Date(
                                asset.indexedMetadata.nft.updated
                              ).toLocaleDateString('es-ES')
                            : '—'
                        }
                      />
                    )}
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

                {activeTab === 'samples' && (
                  <div className={styles.samples}>
                    <p className={styles.samplesEmpty}>
                      No hay muestras disponibles para este asset.
                    </p>
                  </div>
                )}

                {activeTab === 'algorithm-io' && (
                  <div className={styles.algorithmIO}>
                    <p className={styles.samplesEmpty}>
                      Información de entradas y salidas del algoritmo.
                    </p>
                  </div>
                )}
              </>
            )}
          </ContentTabs>
        </div>

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
