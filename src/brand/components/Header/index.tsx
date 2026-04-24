import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMarketMetadata } from '@context/MarketMetadata'
import { BrandLogo } from '../../resolver'
import Wallet from '@components/Header/Wallet'
import NavMobile from './NavMobile'
import styles from './Header.module.css'
import type { HeaderProps, NavItem } from './types'

export default function Header({ className }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const { siteContent } = useMarketMetadata()

  // siteContent.menu contiene los items de navegación desde content/site.json
  const navItems: NavItem[] = (siteContent?.menu ?? []).map(
    (item: { name: string; link?: string }) => ({
      label: item.name,
      href: item.link || '#'
    })
  )

  return (
    <header className={`${styles.header} ${className ?? ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <div className={styles.logoArea}>
          <Link href="/" aria-label="Ir a inicio">
            <BrandLogo
              alt={siteContent?.siteTitle ?? 'Market'}
              width={120}
              height={32}
            />
          </Link>
        </div>

        {/* Navegación desktop */}
        <nav className={styles.nav} aria-label="Navegación principal">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${
                router.pathname === item.href ? styles.active : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Acciones (wallet, publish) */}
        <div className={styles.actions}>
          <Wallet />
        </div>

        {/* Toggle mobile */}
        <button
          className={styles.mobileToggle}
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={mobileOpen}
        >
          ☰
        </button>
      </div>

      {/* Navegación mobile */}
      <NavMobile
        items={navItems}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </header>
  )
}
