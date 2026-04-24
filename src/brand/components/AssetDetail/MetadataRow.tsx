import styles from './AssetDetail.module.css'

interface MetadataRowProps {
  label: string
  value: string | React.ReactNode
  mono?: boolean
  copyable?: boolean
  truncate?: boolean
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
