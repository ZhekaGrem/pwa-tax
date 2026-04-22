'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, MapPin, Sparkles, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type CountyKey = 'harris' | 'travis' | 'dallas'

type County = {
  key: CountyKey
  name: string
  code: string
  city: string
  avgReductionPct: number
  typicalOvershoot: number
  successRate: number
}

const COUNTIES: County[] = [
  {
    key: 'harris',
    name: 'Harris',
    code: '201',
    city: 'Houston',
    avgReductionPct: 0.094,
    typicalOvershoot: 0.12,
    successRate: 0.78,
  },
  {
    key: 'travis',
    name: 'Travis',
    code: '227',
    city: 'Austin',
    avgReductionPct: 0.081,
    typicalOvershoot: 0.105,
    successRate: 0.71,
  },
  {
    key: 'dallas',
    name: 'Dallas',
    code: '113',
    city: 'Dallas',
    avgReductionPct: 0.088,
    typicalOvershoot: 0.115,
    successRate: 0.74,
  },
]

const EFFECTIVE_TAX_RATE = 0.0224 // blended Texas effective rate

function formatUSD(n: number) {
  return Math.round(n).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

function Amount({
  value,
  className,
  prefix = '$',
}: {
  value: number
  className?: string
  prefix?: string
}) {
  return (
    <span className={cn('inline-block font-mono tabular-nums', className)}>
      {prefix + Math.round(value).toLocaleString('en-US')}
    </span>
  )
}

export function Calculator() {
  const [assessed, setAssessed] = useState(420_000)
  const [countyKey, setCountyKey] = useState<CountyKey>('harris')
  const [interactions, setInteractions] = useState(0)
  const county = COUNTIES.find((c) => c.key === countyKey)!
  const bump = () => setInteractions((n) => n + 1)

  const { fairValue, annualSaving, fiveYearSaving } = useMemo(() => {
    const fair = Math.max(0, assessed * (1 - county.typicalOvershoot))
    const saving = Math.max(0, (assessed - fair) * EFFECTIVE_TAX_RATE)
    return {
      fairValue: fair,
      annualSaving: saving,
      fiveYearSaving: saving * 5,
    }
  }, [assessed, county])

  return (
    <section id="calculator" className="relative px-5 sm:px-8 pt-16 pb-20">
      <div className="mx-auto w-full max-w-[1200px]">
        {/* Hydration probe — if interactions stays at 0 while you touch the
            controls, React isn't hydrating (stale bundle / cache). The
            "Force reload" link hard-reloads bypassing HTTP cache. */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-haze/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
          <span>
            interactions · <span className="text-ink tabular-nums">{interactions}</span>
          </span>
          <span>
            state · assessed {assessed.toLocaleString('en-US')} · county {county.name}
          </span>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                try {
                  if ('caches' in window)
                    caches.keys().then((ks) => ks.forEach((k) => caches.delete(k)))
                } catch {}
                sessionStorage.removeItem('__dev_sw_flushed__')
                window.location.href = window.location.pathname + '?nocache=' + Date.now()
              }
            }}
            className="rounded-full border border-ink/30 px-2 py-0.5 text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            Force reload
          </button>
        </div>

        <header className="mb-8 flex items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
              02 — Instrument
            </div>
            <h2 className="mt-3 text-4xl sm:text-6xl font-display font-black tracking-ultra-tight leading-[0.9] text-balance">
              Estimate your
              <br />
              <span className="text-signal">refund</span>.
            </h2>
          </div>
          <div className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.24em] text-stone text-right max-w-[180px]">
            Blended effective
            <br />
            tax rate
            <br />
            <span className="text-ink">{(EFFECTIVE_TAX_RATE * 100).toFixed(2)}%</span>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          {/* Input card */}
          <div className="lg:col-span-7 rounded-3xl border border-hairline bg-paper p-6 sm:p-8">
            <div className="block font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
              Assessed value · HCAD notice
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl sm:text-6xl font-display font-black tracking-ultra-tight text-stone">
                $
              </span>
              <input
                inputMode="numeric"
                value={assessed.toLocaleString('en-US')}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '')
                  setAssessed(Math.min(9_999_999, Math.max(0, Number(raw) || 0)))
                  bump()
                }}
                className="w-full bg-transparent font-display font-black tracking-ultra-tight text-5xl sm:text-7xl leading-none outline-none placeholder:text-stone/30 caret-signal"
                aria-label="Assessed value"
              />
            </div>

            <div className="mt-6">
              <input
                type="range"
                min={50_000}
                max={2_000_000}
                step={5_000}
                value={assessed}
                onChange={(e) => {
                  setAssessed(Number(e.target.value))
                  bump()
                }}
                className="w-full accent-[var(--signal)]"
                aria-label="Assessed value slider"
              />
              <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                <span>$50K</span>
                <span>$500K</span>
                <span>$1M</span>
                <span>$2M</span>
              </div>
            </div>

            <div className="mt-10">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
                County · appraisal district
              </div>
              <div aria-label="County" className="mt-3 grid grid-cols-3 gap-3">
                {COUNTIES.map((c) => {
                  const selected = c.key === countyKey
                  return (
                    <button
                      key={c.key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setCountyKey(c.key)
                        bump()
                      }}
                      className={cn(
                        'group relative flex flex-col items-start rounded-2xl border px-4 py-4 text-left transition-all min-h-[96px]',
                        selected
                          ? 'border-ink bg-ink text-paper'
                          : 'border-hairline bg-paper hover:border-ink/60',
                      )}
                    >
                      <MapPin
                        className={cn(
                          'size-4 stroke-[1.25]',
                          selected ? 'text-neon' : 'text-stone',
                        )}
                      />
                      <div className="mt-6 font-display text-2xl font-black tracking-tight leading-none">
                        {c.name}
                      </div>
                      <div
                        className={cn(
                          'mt-1 font-mono text-[10px] uppercase tracking-[0.2em]',
                          selected ? 'text-paper/60' : 'text-stone',
                        )}
                      >
                        {c.city} · {c.code}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Savings readout */}
          <div className="lg:col-span-5">
            <div className="relative h-full overflow-hidden rounded-3xl border border-ink bg-ink text-paper p-6 sm:p-8">
              <div className="relative flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-paper/50">
                  Est. annual saving
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-paper/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/70">
                  <TrendingDown className="size-3 stroke-[1.25]" />
                  live
                </span>
              </div>

              <div
                className="relative mt-3 font-display font-black tracking-ultra-tight text-[clamp(3rem,11vw,6rem)] leading-[0.82] neon-glow"
                style={{ color: 'var(--neon)' }}
              >
                <Amount value={annualSaving} />
              </div>

              <div className="relative mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
                <Metric label="Fair value (est.)" value={formatUSD(fairValue)} />
                <Metric
                  label="Over-assessed"
                  value={`${(county.typicalOvershoot * 100).toFixed(1)}%`}
                />
                <Metric label="5-yr horizon" value={formatUSD(fiveYearSaving)} />
                <Metric
                  label={`${county.name} win rate`}
                  value={`${Math.round(county.successRate * 100)}%`}
                />
              </div>

              {/* Trajectory chart: real evidence, not decoration */}
              <figure className="relative mt-6 rounded-2xl border border-paper/15 bg-paper/5 p-4">
                <figcaption className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55">
                  <span>Assessed vs. fair · 5-yr horizon</span>
                  <span className="text-[var(--neon)]">▲ savings</span>
                </figcaption>
                <div className="relative mt-3 h-[92px] w-full overflow-hidden rounded-lg">
                  <Image
                    src="/icon-home-with-tax-dashbord.png"
                    alt="Projected assessed value versus fair value over five years"
                    fill
                    sizes="(min-width: 1024px) 25vw, 90vw"
                    className="object-cover object-center mix-blend-screen opacity-80"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(180deg, transparent 0%, color-mix(in oklch, var(--ink) 30%, transparent) 100%)',
                    }}
                  />
                </div>
              </figure>

              <Link
                href="/sign-in"
                className="relative mt-7 inline-flex w-full items-center justify-between gap-3 rounded-2xl bg-paper px-6 py-4 font-display text-lg font-bold text-ink transition-transform hover:scale-[0.99] active:scale-[0.98]"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="size-4 stroke-[1.25]" />
                  Start my appeal
                </span>
                <ArrowUpRight className="size-5 stroke-[1.25]" />
              </Link>

              <p className="relative mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">
                Form 50-132 · auto-filled · ready in 4 min
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-paper/50">{label}</div>
      <div className="mt-1 font-mono text-xl font-bold tracking-tight text-paper">{value}</div>
    </div>
  )
}
