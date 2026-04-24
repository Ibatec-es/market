// src/brand/content/index.ts
import defaultContent from './default/site.json'

const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || 'default'

const brandContents: Record<string, unknown> = {
  default: defaultContent
}

export const brandSiteContent = brandContents[BRAND_ID] ?? {}
