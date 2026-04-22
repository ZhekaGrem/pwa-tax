import { CloudOff, Download, Lock, Gauge, FileCheck, Sparkles } from 'lucide-react'

const FEATURES = [
  {
    index: '01',
    title: 'Offline first.',
    body: 'Draft your protest in the car, on the subway, in dead-zone East Texas. Syncs when you reconnect.',
    Icon: CloudOff,
  },
  {
    index: '02',
    title: 'One-tap install.',
    body: 'Add to Home Screen. No App Store, no reviewers, no 30% cut. It just lives on your phone.',
    Icon: Download,
  },
  {
    index: '03',
    title: 'Private by default.',
    body: 'Evidence and parcels stay encrypted on-device. Zero trackers. Your neighbor never sees your bill.',
    Icon: Lock,
  },
  {
    index: '04',
    title: 'Form 50-132 auto-fill.',
    body: 'We pre-populate the official Texas protest form with your parcel data and picked comparables.',
    Icon: FileCheck,
  },
  {
    index: '05',
    title: 'Faster than an accountant.',
    body: 'Average time-to-filed: 4 min 12 s. Lighthouse 100. Cold start under 1.2 seconds on 4G.',
    Icon: Gauge,
  },
  {
    index: '06',
    title: 'Evidence, polished.',
    body: 'Select 3–5 comparable sales. We render a chart-ready PDF that matches HCAD’s formatting.',
    Icon: Sparkles,
  },
]

export function PwaShowcase() {
  return (
    <section id="features" className="relative px-5 sm:px-8 py-20 bg-haze">
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
              03 — Platform
            </div>
            <h2 className="mt-3 text-4xl sm:text-6xl font-display font-black tracking-ultra-tight leading-[0.9] text-balance">
              A tool, not
              <br />
              an app store.
            </h2>
          </div>
          <p className="max-w-sm font-mono text-xs leading-relaxed text-stone">
            Progressive Web App. Installs from Safari or Chrome in three seconds. No updates to
            chase. No sign-in keychains to forget.
          </p>
        </header>

        {/* Mobile: snap carousel. Desktop ≥md: full 6-up grid, nothing clipped. */}
        <div className="relative mt-12 -mx-5 sm:-mx-8 md:mx-0">
          <div
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 sm:px-8 pb-6 [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3"
            style={{ scrollbarWidth: 'none' }}
          >
            {FEATURES.map(({ index, title, body, Icon }) => (
              <article
                key={index}
                className="group relative shrink-0 snap-center w-[78vw] sm:w-[320px] md:w-auto rounded-3xl glass p-7 flex flex-col min-h-[260px]"
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-6 stroke-[1] text-ink" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
                    {index}
                  </span>
                </div>
                <h3 className="mt-12 font-display text-2xl font-black tracking-tight leading-[0.95]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone">{body}</p>
                <div className="mt-auto pt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
                  — capability {index}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
