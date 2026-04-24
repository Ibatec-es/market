import styles from './LayoutToggle.module.css'

interface LayoutToggleProps {
  value: 'grid' | 'list'
  onChange: (value: 'grid' | 'list') => void
}

export default function LayoutToggle({ value, onChange }: LayoutToggleProps) {
  return (
    <div className={styles.toggle} role="group" aria-label="Vista del catálogo">
      <button
        className={`${styles.btn} ${value === 'grid' ? styles.active : ''}`}
        onClick={() => onChange('grid')}
        aria-pressed={value === 'grid'}
        title="Vista en cuadrícula"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      </button>
      <button
        className={`${styles.btn} ${value === 'list' ? styles.active : ''}`}
        onClick={() => onChange('list')}
        aria-pressed={value === 'list'}
        title="Vista en lista"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="2" width="14" height="2" rx="1" />
          <rect x="1" y="7" width="14" height="2" rx="1" />
          <rect x="1" y="12" width="14" height="2" rx="1" />
        </svg>
      </button>
    </div>
  )
}
