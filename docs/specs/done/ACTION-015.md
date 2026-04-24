# ACTION-015 — Implementar Header corporativo

## Contexto del proyecto

Fork: `Ibatec-es/market` — fork de `OceanProtocolEnterprise/market`.
Stack: Next.js, TypeScript, CSS Modules.
Estado previo: ACTION-014 completada. Tag `v2-tokens-applied`. Sistema de tokens operativo.

Esta acción inicia la Fase 3 — Shell corporativo. Es la primera implementación de componente custom desde cero.

## Objetivo de esta acción

Crear `src/brand/components/Header/index.tsx` como reemplazo corporativo del Header del core. Registrarlo en el resolver. El nuevo Header es responsive, se alimenta de `siteContent` y no tiene texto hardcodeado.

## Paso 1 — Analizar el Header del core

Antes de escribir el nuevo, entender exactamente qué hace el original:

```bash
cat src/components/Header/index.tsx
cat src/components/Header/Menu.tsx
```

Anotar:

- Qué props recibe (si las tiene)
- Cómo accede a `siteContent` (via hook, context, props)
- Qué elementos renderiza (logo, nav, CTAs, wallet button)
- Cómo gestiona el estado mobile (useState, CSS puro)
- Qué clases o módulos CSS usa

El Header custom debe cumplir el mismo contrato funcional (conectar wallet, mostrar navegación) con una implementación visual diferente.

## Paso 2 — Estructura de archivos a crear

```
src/brand/components/Header/
├── index.tsx          # Componente principal
├── Header.module.css  # Estilos del header custom
├── NavDesktop.tsx     # Navegación desktop
├── NavMobile.tsx      # Drawer de navegación mobile
└── types.ts           # Tipos locales del header
```

## Paso 3 — Implementar `types.ts`

```typescript
// src/brand/components/Header/types.ts

export interface NavItem {
  label: string
  href: string
  external?: boolean
}

export interface HeaderProps {
  // Sin props requeridas — el header se alimenta del contexto
  className?: string
}
```

## Paso 4 — Implementar `Header.module.css`

```css
/* src/brand/components/Header/Header.module.css */

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 64px;
  background-color: var(--color-bg-primary);
  border-bottom: var(--card-border);
  display: flex;
  align-items: center;
}

.inner {
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-pad);
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.logoArea {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.nav {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.navItem {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: var(--transition-colors);
}

.navItem:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-secondary);
}

.navItem.active {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* Mobile */
.mobileToggle {
  display: none;
  padding: var(--space-2);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }

  .mobileToggle {
    display: flex;
  }
}
```

## Paso 5 — Implementar `NavMobile.tsx`

```typescript
// src/brand/components/Header/NavMobile.tsx

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
```

Crear `NavMobile.module.css` con estilos del drawer: posición fixed a la derecha, ancho 280px, fondo blanco, z-index 200, backdrop semitransparente.

## Paso 6 — Implementar `index.tsx`

```typescript
// src/brand/components/Header/index.tsx

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMarketMetadata } from '../../../@context/MarketMetadata'
import { BrandLogo } from '../../resolver'
import NavMobile from './NavMobile'
import styles from './Header.module.css'
import type { HeaderProps, NavItem } from './types'

export default function Header({ className }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const { siteContent } = useMarketMetadata()

  // siteContent.menu contiene los items de navegación desde content/site.json
  // Verificar el nombre exacto del campo en el JSON del proyecto
  const navItems: NavItem[] = siteContent?.menu ?? []

  return (
    <header className={`${styles.header} ${className ?? ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <div className={styles.logoArea}>
          <Link href="/" aria-label="Ir a inicio">
            <BrandLogo
              src="/brand/assets/default/logo.svg"
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
          {/* TODO ACTION-015: Importar el WalletButton del core aquí */}
          {/* Los botones de acción del marketplace vienen del core */}
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
```

> **Nota crítica:** El Header del core gestiona funcionalidad de wallet (conectar/desconectar). Antes de finalizar esta implementación, identificar el componente de wallet del core y asegurarse de que se incluye en el área de `actions`. No reimplementar funcionalidad de wallet — importarla del core.

```bash
grep -r "wallet\|connect\|Web3\|ConnectButton" src/components/ --include="*.tsx" -l
```

## Paso 7 — Registrar en el resolver

```typescript
// src/brand/resolver.ts — actualizar esta línea:

// ANTES:
export { default as BrandHeader } from '../components/Header'

// DESPUÉS:
export { default as BrandHeader } from './components/Header'
```

## Paso 8 — Verificación

```bash
npm run dev
```

Verificar en todas las rutas:

- [ ] Logo se renderiza correctamente
- [ ] Navegación desktop muestra los items del `site.json`
- [ ] Hover y estado activo funcionan
- [ ] En mobile (375px): nav desktop oculta, toggle visible
- [ ] Drawer mobile abre y cierra correctamente
- [ ] Navegar desde el drawer cierra el drawer
- [ ] La funcionalidad de wallet sigue funcionando

## Qué evitar

- No copiar el CSS del Header del core. Escribir desde cero con los tokens brand.
- No hardcodear items de navegación. Todo viene de `siteContent.menu`.
- No reimplementar la lógica de wallet. Importar el componente del core.
- No usar `position: fixed` para el header — usar `sticky` para no romper el scroll natural.

## Entregable

- `src/brand/components/Header/` con todos los archivos implementados.
- `src/brand/resolver.ts` actualizado para usar el Header corporativo.
- Header visible y funcional en toda la app.

## Criterio de hecho

El Header corporativo se renderiza en todas las rutas. La navegación funciona. El mobile drawer funciona. La funcionalidad de wallet no está rota. `npm run build` sin errores.
