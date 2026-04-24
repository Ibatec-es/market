import type { NextPage } from 'next'
import Head from 'next/head'
import { useMarketMetadata } from '../@context/MarketMetadata'

// Core home — se mantiene intacto como fallback
import CoreHome from '../components/Home'
import Page from '../components/@shared/Page'

// Brand landing — solo se carga cuando está configurada
// El import dinámico evita añadir el bundle de la landing al chunk de la home del core
import dynamic from 'next/dynamic'
const BrandLanding = dynamic(() => import('../brand/components/Landing'), {
  ssr: true
})

// Flag para activar la landing corporativa
// Se considera activa si existe contenido de landing para el brand actual
const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || 'default'
const USE_BRAND_LANDING = BRAND_ID !== ''

const HomePage: NextPage = () => {
  const { siteContent } = useMarketMetadata()

  if (USE_BRAND_LANDING) {
    return (
      <>
        <Head>
          <title>{siteContent?.siteTitle ?? 'Market'}</title>
          <meta
            name="description"
            content={
              siteContent?.siteTagline ?? 'Marketplace de datos empresariales'
            }
          />
        </Head>
        <BrandLanding />
      </>
    )
  }

  // Fallback: home original del core
  return (
    <Page
      title={siteContent?.siteTitle}
      description={siteContent?.siteTagline}
      uri="/"
    >
      <CoreHome />
    </Page>
  )
}

export default HomePage
