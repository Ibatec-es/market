export type DetailTab =
  | 'description'
  | 'metadata'
  | 'samples'
  | 'algorithm-io'
  | 'history'

export interface DetailConfig {
  tabs: DetailTab[]

  actionPanel: {
    position: 'sidebar' | 'top'
    showPriceBreakdown: boolean
    showAccessCount: boolean
    showPublisher: boolean
  }

  technicalMetadata: {
    showDID: boolean
    showDatatokenAddress: boolean
    showChainId: boolean
    showCreatedDate: boolean
    showUpdatedDate: boolean
    showLicense: boolean
    showDockerImage: boolean
    showAlgorithmLanguage: boolean
    showEntrypoint: boolean
  }

  showRelatedAssets: boolean
  differentiateTypes: boolean
}

const defaultDetailConfig: DetailConfig = {
  tabs: ['description', 'metadata', 'samples'],
  actionPanel: {
    position: 'sidebar',
    showPriceBreakdown: false,
    showAccessCount: true,
    showPublisher: true
  },
  technicalMetadata: {
    showDID: true,
    showDatatokenAddress: false,
    showChainId: true,
    showCreatedDate: true,
    showUpdatedDate: true,
    showLicense: true,
    showDockerImage: false,
    showAlgorithmLanguage: false,
    showEntrypoint: false
  },
  showRelatedAssets: false,
  differentiateTypes: true
}

const algorithmDetailConfig: Partial<DetailConfig> = {
  tabs: ['description', 'algorithm-io', 'metadata'],
  technicalMetadata: {
    ...defaultDetailConfig.technicalMetadata,
    showDockerImage: true,
    showAlgorithmLanguage: true,
    showEntrypoint: true
  }
}

const detailConfigs: Record<string, Partial<DetailConfig>> = {
  default: {},
  'demo-client': {
    actionPanel: {
      position: 'top',
      showPriceBreakdown: true,
      showAccessCount: true,
      showPublisher: false
    },
    showRelatedAssets: true
  }
}

export function getDetailConfig(
  assetType?: 'dataset' | 'algorithm'
): DetailConfig {
  const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || 'default'
  const brandOverride = detailConfigs[BRAND_ID] ?? {}
  const typeOverride = assetType === 'algorithm' ? algorithmDetailConfig : {}

  return {
    ...defaultDetailConfig,
    ...typeOverride,
    ...brandOverride,
    actionPanel: {
      ...defaultDetailConfig.actionPanel,
      ...(typeOverride.actionPanel ?? {}),
      ...(brandOverride.actionPanel ?? {})
    },
    technicalMetadata: {
      ...defaultDetailConfig.technicalMetadata,
      ...(typeOverride.technicalMetadata ?? {}),
      ...(brandOverride.technicalMetadata ?? {})
    }
  }
}
