import { ReactElement } from 'react'
import LogoAsset from '@images/logo.svg'
import styles from './index.module.css'

interface LogoProps {
  className?: string
  src?: string
  alt?: string
  width?: number
  height?: number
}

export default function Logo({
  className = styles.logo,
  src,
  alt = 'Logo',
  width = 120,
  height = 32
}: LogoProps): ReactElement {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    )
  }

  return <LogoAsset className={className} />
}
