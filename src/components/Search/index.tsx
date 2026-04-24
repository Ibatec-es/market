import { ReactElement, useState, useEffect, useCallback, useMemo } from 'react'
import AssetList from '@shared/AssetList'
import queryString from 'query-string'
import Filter, { useFilterList } from './Filter'
import Sort from './sort'
import { buildSearchPageUrl, getResults, addExistingParamsToUrl } from './utils'
import { useCancelToken } from '@hooks/useCancelToken'
import styles from './index.module.css'
import { useRouter } from 'next/router'
import { useDebouncedCallback } from 'use-debounce'
import SearchBar from '@components/Header/SearchBar'
import { useMarketMetadata } from '@context/MarketMetadata'
import { useFilter } from '@context/Filter'
import Pagination from '@shared/Pagination'
import { BrandCatalogLayout } from '../../brand/resolver'

export default function SearchPage({
  setTotalResults,
  setTotalPagesNumber
}: {
  setTotalResults: (totalResults: number) => void
  setTotalPagesNumber: (totalPagesNumber: number) => void
}): ReactElement {
  const router = useRouter()
  const [parsed, setParsed] = useState<queryString.ParsedQuery<string>>()
  const { validatedSupportedChains, isValidatingSupportedChains } =
    useMarketMetadata()
  const [queryResult, setQueryResult] = useState<PagedAssets>()
  const [loading, setLoading] = useState<boolean>(true)
  const newCancelToken = useCancelToken()
  const { filters, setFilters, ignorePurgatory, setIgnorePurgatory } =
    useFilter()
  const filterList = useFilterList()

  const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || 'default'
  const isBrandActive = BRAND_ID !== 'default'

  useEffect(() => {
    if (!router.isReady) return

    const parsed = queryString.parse(location.search, {
      arrayFormat: 'separator'
    })
    setParsed(parsed)
  }, [router.isReady, router.asPath])

  const updatePage = useCallback(
    (page: number) => {
      const newUrl = buildSearchPageUrl(router.pathname, location.search, page)
      return router.push(newUrl)
    },
    [router]
  )

  const fetchAssets = useDebouncedCallback(
    async (parsed: queryString.ParsedQuery<string>, chainIds: number[]) => {
      setLoading(true)
      setTotalResults(undefined)
      const queryResult = await getResults(parsed, chainIds, newCancelToken())
      setQueryResult(queryResult)

      setTotalResults(queryResult?.totalResults || 0)
      setTotalPagesNumber(queryResult?.totalPages || 0)
      setLoading(false)
    },
    500
  )
  useEffect(() => {
    if (!parsed || !queryResult) return
    const { page } = parsed
    if (queryResult.totalPages < Number(page)) updatePage(1)
  }, [parsed, queryResult, updatePage])

  useEffect(() => {
    if (
      !parsed ||
      isValidatingSupportedChains ||
      validatedSupportedChains.length === 0
    )
      return

    fetchAssets(parsed, validatedSupportedChains)
  }, [
    parsed,
    validatedSupportedChains,
    fetchAssets,
    isValidatingSupportedChains
  ])

  async function applyFilter(filter: string[], filterId: string) {
    let urlLocation = await addExistingParamsToUrl(location, [filterId])
    if (filter.length > 0 && urlLocation.indexOf(filterId) === -1) {
      const parsedFilter = filter.join(',')
      urlLocation = `${urlLocation}&${filterId}=${parsedFilter}`
    }
    router.push(urlLocation)
  }

  async function handleFilterChange(
    key: string,
    value: string,
    checked: boolean
  ) {
    let updatedFilters = { ...filters }
    if (key === 'filterTime') {
      if (filters[key].includes(value)) {
        updatedFilters[key] = []
      } else {
        updatedFilters[key] = [value]
      }
    } else if (key === 'supportedBlockchain') {
      const nextValues = filters[key].includes(value)
        ? filters[key].filter((entry) => entry !== value)
        : [...filters[key], value]

      updatedFilters[key] = nextValues.length === 0 ? [] : nextValues
    } else {
      updatedFilters = filters[key].includes(value)
        ? {
            ...filters,
            [key]: filters[key].filter((e) => e !== value)
          }
        : { ...filters, [key]: [...filters[key], value] }
    }

    setFilters(updatedFilters)
    await applyFilter(updatedFilters[key], key)
  }

  async function clearFilters() {
    const clearedFilters = { ...filters }
    Object.keys(clearedFilters).forEach((key) => (clearedFilters[key] = []))
    setFilters(clearedFilters)

    if (ignorePurgatory !== undefined && setIgnorePurgatory !== undefined)
      setIgnorePurgatory(true)

    const urlLocation = await addExistingParamsToUrl(
      location,
      Object.keys(clearedFilters)
    )
    router.push(urlLocation)
  }

  if (isBrandActive && BrandCatalogLayout) {
    const mappedFilterGroups = filterList.map((f: any) => ({
      label: f.label,
      key: f.id,
      options: f.options,
      type: 'checkbox'
    }))

    return (
      <div className={styles.container} style={{ flexDirection: 'column' }}>
        <div
          className={styles.searchContainer}
          style={{ width: '100%', marginBottom: 'var(--space-6)' }}
        >
          <SearchBar placeholder="Buscar en el catálogo" />
        </div>
        <BrandCatalogLayout
          assets={queryResult?.results || []}
          totalResults={queryResult?.totalResults || 0}
          isLoading={loading}
          filterGroups={mappedFilterGroups}
          activeFilters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
        >
          {queryResult && queryResult.totalPages > 1 && (
            <Pagination
              totalPages={queryResult.totalPages}
              currentPage={queryResult.page}
              onChangePage={(selected) => updatePage(selected + 1)}
            />
          )}
        </BrandCatalogLayout>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.filterContainer}>
        <Filter addFiltersToUrl expanded />
        <Sort expanded />
      </div>
      <div className={styles.results}>
        <div className={styles.searchContainer}>
          <SearchBar placeholder="Search for service offerings" />
        </div>
        <AssetList
          assets={queryResult?.results}
          showPagination
          isLoading={loading}
          page={queryResult?.page}
          totalPages={queryResult?.totalPages}
          onPageChange={updatePage}
          showAssetViewSelector
        />
      </div>
    </div>
  )
}
