import { useState, useEffect, ReactElement } from 'react'
import { useRouter } from 'next/router'
import Page from '@shared/Page'
import Alert from '@shared/atoms/Alert'
import Loader from '@shared/atoms/Loader'
import { useAsset } from '@context/Asset'
import AssetContent from './AssetContent'
import { BrandAssetDetail } from '../../brand/resolver'

export default function AssetDetails({ uri }: { uri: string }): ReactElement {
  const router = useRouter()
  const { asset, title, error, isInPurgatory, loading } = useAsset()
  const [pageTitle, setPageTitle] = useState<string>()

  const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || 'default'
  const isBrandActive = BRAND_ID !== 'default'

  useEffect(() => {
    if (!asset || error) {
      setPageTitle(title || 'Could not retrieve asset')
      return
    }
    setPageTitle(isInPurgatory ? '' : title)
  }, [asset, error, isInPurgatory, router, title, uri])

  if (asset && pageTitle !== undefined && !loading) {
    if (isBrandActive && BrandAssetDetail) {
      return (
        <Page title={pageTitle} uri={uri}>
          <BrandAssetDetail
            asset={asset}
            // For now we don't hook up onBuy/onAccess because the core uses AssetActions deeply.
            // Ideally we'd extract the buy/access handler, but we pass asset for now
          />
        </Page>
      )
    }

    return (
      <Page title={pageTitle} uri={uri}>
        <AssetContent asset={asset} />
      </Page>
    )
  }

  return error ? (
    <Page title={pageTitle} noPageHeader uri={uri}>
      <Alert title={pageTitle} text={error} state={'error'} />
    </Page>
  ) : (
    <Page title={undefined} uri={uri}>
      <Loader />
    </Page>
  )
}
