import { ReactElement } from 'react'
import CoreLogo from '../../../components/@shared/atoms/Logo'

const BRAND_ID = process.env.NEXT_PUBLIC_BRAND_ID || 'default'

const LOGO_MAP: Record<string, string> = {
  default: '/brand/assets/default/logo.svg',
  'demo-client': '/brand/assets/demo-client/logo.svg',
  'test-onboarding': '/brand/assets/test-onboarding/logo.svg'
}

interface LogoProps {
  className?: string
  alt?: string
  width?: number
  height?: number
}

export default function BrandLogo({
  className,
  alt = 'Logo',
  width = 120,
  height = 32
}: LogoProps): ReactElement {
  const src = LOGO_MAP[BRAND_ID] || LOGO_MAP.default

  return (
    <CoreLogo
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  )
}
