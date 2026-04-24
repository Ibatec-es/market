export interface HeroContent {
  headline: string
  subheadline: string
  ctaPrimary: { label: string; href: string }
  ctaSecondary?: { label: string; href: string }
  badge?: string // Texto de etiqueta encima del headline (opcional)
}

export interface ValueProp {
  id: string
  icon: string // nombre de icono o emoji de placeholder
  title: string
  description: string
}

export interface ProcessStep {
  number: number
  title: string
  description: string
}

export interface CtaSection {
  headline: string
  subheadline?: string
  cta: { label: string; href: string }
}

export interface LandingContent {
  hero: HeroContent
  valueProps: {
    title: string
    items: ValueProp[]
  }
  process: {
    title: string
    steps: ProcessStep[]
  }
  cta: CtaSection
}
