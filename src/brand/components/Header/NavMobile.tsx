import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from './NavMobile.module.css'
import type { NavItem } from './types'

interface NavMobileProps {
  items: NavItem[]
  isOpen: boolean
  onClose: () => void
}

export default function NavMobile({ items, isOpen, onClose }: NavMobileProps) {
  const router = useRouter()

  // Cerrar al cambiar de ruta
  useEffect(() => {
    router.events.on('routeChangeStart', onClose)
    return () => router.events.off('routeChangeStart', onClose)
  }, [router.events, onClose])

  // Bloquear scroll cuando está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <nav className={styles.drawer} aria-label="Navegación principal">
        <div className={styles.drawerHeader}>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className={styles.closeBtn}
          >
            ✕
          </button>
        </div>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={styles.item}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
