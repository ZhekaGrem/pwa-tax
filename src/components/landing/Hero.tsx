import Link from 'next/link'
import Image from 'next/image'
import { ArrowDown, Compass } from 'lucide-react'

const LIVE_STATS = [
  { k: 'Avg. refund · 2025', v: '$3,842' },
  { k: 'Reduction rate', v: '92%' },
  { k: 'Median time to file', v: '4 m 12 s' },
]

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden px-5 sm:px-8 pt-5 pb-8"
    >
      {/* Disciplined backdrop — single blueprint tint, hairline grid, paper fade.
          No colored glows. Everything multiplied into paper so copy stays crisp. */}
      <Image
        src="/abstract-map-texas.png"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="hero-map -z-10 object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hairline-grid opacity-[0.08]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in oklch, var(--paper) 88%, transparent) 0%, color-mix(in oklch, var(--paper) 35%, transparent) 40%, color-mix(in oklch, var(--paper) 92%, transparent) 100%)',
        }}
      />

      {/* Instrument bar */}
      <div className="relative flex items-stretch justify-between gap-3 rounded-2xl border border-hairline bg-paper/75 px-3 py-2 backdrop-blur-md sm:px-4 hero-in">
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.3em] text-stone sm:inline">
            № 001
          </span>
          <span aria-hidden className="hidden h-5 w-px bg-hairline sm:block" />
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden className="text-ink">
              <path
                d="M3 20 L12 4 L21 20 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="14" r="1.4" fill="var(--signal)" />
            </svg>
            <span className="font-display text-sm font-black tracking-tight text-ink">
              Protest Pilot
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-stone sm:inline">
              / TX
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-5 font-mono text-[10px] uppercase tracking-[0.22em] text-stone lg:flex">
          <span>live · 2026 cycle</span>
          <span aria-hidden className="h-4 w-px bg-hairline" />
          <span>Form 50-132</span>
          <span aria-hidden className="h-4 w-px bg-hairline" />
          <span>Est. 4 min · filing</span>
        </div>

        <Link
          href="/sign-in"
          className="group inline-flex items-center gap-2 rounded-xl bg-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-paper transition-transform hover:-translate-y-px sm:px-4 sm:py-2 sm:text-[11px]"
        >
          Sign in
          <svg
            viewBox="0 0 16 16"
            width="12"
            height="12"
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path
              d="M3 8 H13 M9 4 L13 8 L9 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      {/* Editorial section code */}
      <div className="mt-10 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-stone hero-in hero-in-1">
        <div className="flex items-center gap-3">
          <span className="text-ink">01</span>
          <span aria-hidden className="h-px w-10 bg-ink" />
          <span>Thesis</span>
        </div>
        <span className="hidden sm:inline">Property tax · 2026 cycle</span>
      </div>

      {/* Headline + stat rail */}
      <div className="relative mt-6 flex flex-1 items-center">
        <div className="grid w-full grid-cols-12 items-center gap-6 lg:gap-10">
          <h1 className="col-span-12 lg:col-span-9 font-display font-black tracking-ultra-tight leading-[0.82] text-balance text-[clamp(3.25rem,12.5vw,10rem)] hero-in hero-in-2">
            Texas taxes
            <br />
            are <span className="italic font-medium">high</span>.
            <br />
            Your bill
            <br />
            <span className="text-signal">doesn’t</span>
            <br />
            have to be.
          </h1>

          <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 border-l border-ink/15 pl-6 hero-in hero-in-3">
            {LIVE_STATS.map((s) => (
              <div key={s.k} className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-stone">
                  {s.k}
                </span>
                <span className="font-display text-3xl font-black tracking-ultra-tight text-ink">
                  {s.v}
                </span>
              </div>
            ))}
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
              254 counties · synced
            </div>
          </aside>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -right-2 top-1/2 hidden origin-right -translate-y-1/2 -rotate-90 font-mono text-[10px] uppercase tracking-[0.36em] text-stone xl:block"
        >
          filed in 4 min · evidence-backed · no app store
        </div>
      </div>

      {/* Mobile stat rail */}
      <div className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline lg:hidden hero-in hero-in-3">
        {LIVE_STATS.map((s) => (
          <div key={s.k} className="flex flex-col gap-1 bg-paper/90 p-3 backdrop-blur-sm">
            <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-stone">
              {s.k}
            </span>
            <span className="font-display text-lg font-black tracking-ultra-tight text-ink">
              {s.v}
            </span>
          </div>
        ))}
      </div>

      {/* Thesis + CTA rail */}
      <div className="mt-10 grid grid-cols-12 items-end gap-6 hero-in hero-in-4">
        <p className="col-span-12 sm:col-span-5 font-mono text-xs leading-relaxed text-stone max-w-[36ch]">
          A Swiss-grade instrument for Texas homeowners. File a precise, evidence-backed protest of
          your 2026 appraisal — in the time it takes to brew coffee.
        </p>

        <div className="col-span-12 sm:col-span-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-end">
          <Link
            href="#calculator"
            className="group inline-flex items-center justify-between gap-3 rounded-2xl bg-ink px-6 py-5 font-display text-lg font-bold text-paper transition-transform active:scale-[0.98] sm:min-w-[300px]"
          >
            <span className="flex items-center gap-3">
              <Compass className="size-5 stroke-[1.25]" />
              Start appraisal
            </span>
            <ArrowDown className="size-5 stroke-[1.25] transition-transform group-hover:translate-y-0.5" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center rounded-2xl border border-ink/25 bg-paper/70 px-6 py-5 font-mono text-xs uppercase tracking-[0.22em] text-ink backdrop-blur-md hover:bg-ink hover:text-paper transition-colors"
          >
            How it works →
          </Link>
        </div>
      </div>
    </section>
  )
}
