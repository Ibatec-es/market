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
