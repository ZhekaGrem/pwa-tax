import { Hero } from '@/components/landing/Hero'
import { Locus } from '@/components/landing/Locus'
import { StatStrip } from '@/components/landing/StatStrip'
import { Calculator } from '@/components/landing/Calculator'
import { PwaShowcase } from '@/components/landing/PwaShowcase'
import { Process } from '@/components/landing/Process'
import { ClosingCta } from '@/components/landing/ClosingCta'
import { LandingFooter } from '@/components/landing/Footer'

export const metadata = {
  title: 'Protest Pilot — Fair Appraisal. One Tap Away.',
  description:
    'Texas taxes are high. Your bill doesn’t have to be. A Swiss-grade instrument for filing a Form 50-132 protest with comparable-sales evidence in under 5 minutes.',
}

export default function Landing() {
  return (
    <main className="relative isolate noise bg-paper text-ink selection:bg-signal selection:text-paper">
      <Hero />
      <Locus />
      <StatStrip />
      <Calculator />
      <div className="section-defer">
        <PwaShowcase />
      </div>
      <div className="section-defer">
        <Process />
      </div>
      <div className="section-defer">
        <ClosingCta />
      </div>
      <div className="section-defer-sm">
        <LandingFooter />
      </div>
    </main>
  )
}
