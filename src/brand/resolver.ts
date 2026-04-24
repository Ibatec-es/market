/**
 * Brand Resolver
 *
 * Punto único de resolución de componentes de shell.
 * Importar siempre desde aquí, nunca directamente del core ni de brand/components/.
 *
 * Para activar un componente custom:
 * 1. Implementarlo en src/brand/components/[Slot]/index.tsx
 * 2. Actualizar el export correspondiente en este archivo.
 *
 * BRAND_ID actual: process.env.NEXT_PUBLIC_BRAND_ID
 */

// --- Header ---
// Cuando exista src/brand/components/Header/index.tsx, cambiar este import.
export { default as BrandHeader } from './components/Header'
// export { default as BrandHeader } from './components/Header'  // ← activar cuando esté listo

// --- Footer ---
export { default as BrandFooter } from './components/Footer'
// export { default as BrandFooter } from './components/Footer'

// --- Logo ---
export { default as BrandLogo } from './components/Logo'

// --- Catalog ---
export { AssetCard as BrandAssetCard } from './components/Catalog'
export { AssetCardList as BrandAssetCardList } from './components/Catalog'
export { getCatalogConfig as getBrandCatalogConfig } from './components/Catalog'
export { default as BrandCatalogLayout } from './components/Catalog/CatalogLayout'

// --- Asset Detail ---
export { default as BrandAssetDetail } from './components/AssetDetail'
