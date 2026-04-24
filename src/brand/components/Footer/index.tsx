import Link from 'next/link'
import { useMarketMetadata } from '@context/MarketMetadata'
import { BrandLogo } from '../../resolver'
import styles from './Footer.module.css'

interface FooterData {
  tagline?: string
  social?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
  columns?: {
    title: string
    links: { label: string; href: string }[]
  }[]
  copyright?: string
}

export default function Footer() {
  const { siteContent } = useMarketMetadata()
  const footer = siteContent?.footer as unknown as FooterData

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Columna de marca */}
          <div className={styles.brand}>
            <Link href="/" aria-label="Ir a inicio">
              <BrandLogo
                src="/brand/assets/default/logo.svg"
                alt={siteContent?.siteTitle ?? 'Market'}
                width={100}
                height={28}
              />
            </Link>
            {footer?.tagline && (
              <p className={styles.tagline}>{footer.tagline}</p>
            )}
            {footer?.social && (
              <div className={styles.social}>
                {footer.social.twitter && (
                  <a
                    href={footer.social.twitter}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                  >
                    𝕏
                  </a>
                )}
                {footer.social.linkedin && (
                  <a
                    href={footer.social.linkedin}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    in
                  </a>
                )}
                {footer.social.github && (
                  <a
                    href={footer.social.github}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                  >
                    gh
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Columnas de enlaces */}
          {footer?.columns?.map(
            (col: {
              title: string
              links: { label: string; href: string }[]
            }) => (
              <div key={col.title} className={styles.column}>
                <p className={styles.columnTitle}>{col.title}</p>
                {col.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={styles.link}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )
          )}
        </div>

        {/* Copyright */}
        <div className={styles.bottom}>
          <span className={styles.copyright}>
            {footer?.copyright ?? `© ${new Date().getFullYear()} Market`}
          </span>
        </div>
      </div>
    </footer>
  )
}
