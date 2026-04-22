import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

function daysUntilMay15() {
  const now = new Date()
  const year =
    now.getMonth() > 4 || (now.getMonth() === 4 && now.getDate() > 15)
      ? now.getFullYear() + 1
      : now.getFullYear()
  const target = new Date(year, 4, 15)
  const ms = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

const WINS = [
  { k: 'Harris', v: '78%' },
  { k: 'Travis', v: '71%' },
  { k: 'Dallas', v: '74%' },
  { k: 'Bexar', v: '69%' },
]

export function ClosingCta() {
  const days = daysUntilMay15()

  return (
    <section aria-label="Call to action" className="relative bg-ink text-paper">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 py-24 sm:py-32">
        {/* header rail */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-paper/15 pb-5 font-mono text-[10px] uppercase tracking-[0.28em] text-paper/55">
          <span>05 — The ask</span>
          <span className="text-paper">{days} days · window closes May 15</span>
        </div>

        {/* editorial headline — no glow, no gradient, no accent color */}
        <h2 className="mt-10 font-display font-black tracking-ultra-tight leading-[0.82] text-balance text-[clamp(3rem,11vw,8.5rem)]">
          Fair appraisal.
          <br />
          One tap away.
        </h2>

        {/* 3-column body — identical composition, zero ornamentation */}
        <div className="mt-16 grid grid-cols-12 gap-x-10 gap-y-12">
          {/* thesis */}
          <div className="col-span-12 md:col-span-5 lg:col-span-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/55">
              The wager
            </div>
            <p className="mt-4 font-display text-xl sm:text-2xl font-medium leading-[1.25] text-paper text-balance">
              Most Texans who file, win. The ones who don’t file lose — quietly — for the next
              twelve months.
            </p>
            <p className="mt-5 font-mono text-[11px] leading-relaxed text-paper/55 max-w-[38ch]">
              Form 50-132, auto-filled with your parcel and three comparable sales. Evidence-ready.
              County-tuned. Filed in four minutes.
            </p>
          </div>

          {/* data — flat hairline table, no backdrops, no cards */}
          <div className="col-span-12 md:col-span-7 lg:col-span-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/55">
              2025 win rates
            </div>
            <dl className="mt-4 divide-y divide-paper/15 border-y border-paper/15">
              {WINS.map((w) => (
                <div key={w.k} className="flex items-baseline justify-between py-4">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper/70">
                    {w.k} · county
                  </dt>
                  <dd className="font-display text-3xl font-black tracking-ultra-tight text-paper">
                    {w.v}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/45">
              Source · appraisal district disclosures, 2025
            </div>
          </div>

          {/* CTA — plain, no surface */}
          <div className="col-span-12 lg:col-span-4 flex flex-col justify-between gap-8">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/55">
                Open instrument
              </div>
              <p className="mt-4 font-display text-2xl font-black tracking-tight leading-[1.05] text-paper">
                Four minutes.
                <br />
                One filing.
                <br />
                Done.
              </p>
            </div>

            <div>
              <Link
                href="/sign-in"
                className="group inline-flex w-full items-center justify-between gap-3 border-b border-paper py-4 font-display text-2xl sm:text-3xl font-black tracking-tight text-paper transition-colors hover:text-paper/70"
              >
                Open Protest Pilot
                <ArrowUpRight className="size-7 stroke-[1.25] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <ul className="mt-5 space-y-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55">
                <li>Form 50-132 · auto-filled</li>
                <li>Comparable sales · pre-attached</li>
                <li>PDF or e-file · ready to submit</li>
              </ul>
            </div>
          </div>
        </div>

        {/* editorial footer rule */}
        <div className="mt-20 flex flex-wrap items-center justify-between gap-3 border-t border-paper/15 pt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-paper/45">
          <span>Protest Pilot · an instrument for Texas homeowners</span>
          <span>2026 · Form 50-132 · TX Comptroller</span>
        </div>
      </div>
    </section>
  )
}
