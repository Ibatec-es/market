import type { LandingContent } from '../types/landing'

export function getLandingContent(): LandingContent {
  const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || 'default'
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(`../content/${BRAND_ID}/landing.json`) as LandingContent
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('../content/default/landing.json') as LandingContent
  }
}
