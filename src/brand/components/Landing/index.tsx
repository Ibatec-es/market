// src/brand/components/Landing/index.tsx

import { getLandingContent } from '../../utils/getLandingContent'
import Hero from './Hero'
import ValueProps from './ValueProps'
import Process from './Process'
import CtaSection from './CtaSection'

export default function Landing() {
  const content = getLandingContent()

  return (
    <main>
      <Hero content={content.hero} />
      <ValueProps content={content.valueProps} />
      <Process content={content.process} />
      <CtaSection content={content.cta} />
    </main>
  )
}
