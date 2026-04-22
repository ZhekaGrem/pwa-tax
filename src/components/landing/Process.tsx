import Image from 'next/image'

type Step = {
  i: string
  title: string
  body: string
  img: string
  imgAlt: string
  time: string
  invert?: boolean
}

const STEPS: Step[] = [
  {
    i: '01',
    title: 'Parcel capture.',
    body: 'Scan your HCAD notice or type the parcel ID. We pull the assessment, square footage, year built, and your district.',
    img: '/icon-calculation-chart.png',
    imgAlt: 'Home with tax dashboard illustration',
    time: '~40 s',
  },
  {
    i: '02',
    title: 'Comparable evidence.',
    body: 'We surface 3–5 nearby properties with lower assessed values. You pick the strongest three. Chart included.',
    img: '/icon-house-with-percent-down.png',
    imgAlt: 'House with downward percentage illustration',
    time: '~2 min',
    invert: true,
  },
  {
    i: '03',
    title: 'Filed-ready PDF.',
    body: 'Form 50-132 auto-filled, signed, timestamped. E-file with your district or download and mail.',
    img: '/icon-legal-gavel.png',
    imgAlt: 'Legal gavel illustration',
    time: '~90 s',
    invert: true,
  },
]

export function Process() {
  return (
    <section id="process" className="relative px-5 sm:px-8 py-24">
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="grid grid-cols-12 items-end gap-6">
          <div className="col-span-12 md:col-span-8">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-stone">
              04 — Method
            </div>
            <h2 className="mt-3 font-display font-black tracking-ultra-tight leading-[0.88] text-balance text-[clamp(2.5rem,7vw,5rem)]">
              Three steps.
              <br />
              Zero government forms.
            </h2>
          </div>
          <p className="col-span-12 md:col-span-4 max-w-sm font-mono text-[11px] leading-relaxed text-stone">
            Every step is visualized. No jargon, no waiting rooms, no phone tag with the appraisal
            district.
          </p>
        </header>

        <ol className="mt-16 grid gap-6 md:grid-cols-12">
          {STEPS.map(({ i, title, body, img, imgAlt, time, invert }, idx) => {
            const span =
              idx === 0
                ? 'md:col-span-5'
                : idx === 1
                  ? 'md:col-span-7'
                  : 'md:col-span-12 lg:col-span-12'
            // simpler rhythm: first narrow, second wide, third full — asymmetric
            return (
              <li
                key={i}
                className={[
                  'relative isolate overflow-hidden rounded-3xl border',
                  span,
                  invert ? 'border-ink bg-ink text-paper' : 'border-hairline bg-paper/95 text-ink',
                ].join(' ')}
              >
                {/* oversized serial as design mark */}
                <div
                  aria-hidden
                  className={[
                    'pointer-events-none absolute -top-6 right-4 select-none font-display font-black tracking-ultra-tight leading-none',
                    invert ? 'text-paper/10' : 'text-ink/[0.06]',
                  ].join(' ')}
                  style={{ fontSize: 'clamp(9rem, 22vw, 16rem)' }}
                >
                  {i}
                </div>

                <div className="relative grid grid-cols-12 gap-0">
                  {/* illustration panel */}
                  <div
                    className={[
                      'col-span-12 md:col-span-5 lg:col-span-5 relative min-h-[220px]',
                      invert ? 'bg-paper/5' : 'bg-haze',
                    ].join(' ')}
                  >
                    <Image
                      src={img}
                      alt={imgAlt}
                      fill
                      sizes="(min-width: 768px) 40vw, 100vw"
                      className={[
                        'object-cover',
                        invert ? 'mix-blend-screen opacity-90' : 'mix-blend-multiply',
                      ].join(' ')}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: invert
                          ? 'linear-gradient(90deg, transparent 55%, var(--ink) 100%)'
                          : 'linear-gradient(90deg, transparent 55%, var(--paper) 100%)',
                      }}
                    />
                    <div
                      className={[
                        'absolute left-4 top-4 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] backdrop-blur-sm',
                        invert ? 'bg-paper/15 text-paper' : 'bg-paper/85 text-ink',
                      ].join(' ')}
                    >
                      fig. {i}
                    </div>
                  </div>

                  {/* body */}
                  <div className="col-span-12 md:col-span-7 lg:col-span-7 flex flex-col gap-5 p-7 sm:p-9">
                    <div className="flex items-center justify-between">
                      <span
                        className={[
                          'font-mono text-[10px] uppercase tracking-[0.28em]',
                          invert ? 'text-paper/55' : 'text-stone',
                        ].join(' ')}
                      >
                        Step {i}
                      </span>
                      <span
                        className={[
                          'rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em]',
                          invert ? 'border-paper/25 text-paper/75' : 'border-hairline text-stone',
                        ].join(' ')}
                      >
                        {time}
                      </span>
                    </div>
                    <h3 className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-[0.95]">
                      {title}
                    </h3>
                    <p
                      className={[
                        'text-sm leading-relaxed max-w-[48ch]',
                        invert ? 'text-paper/70' : 'text-stone',
                      ].join(' ')}
                    >
                      {body}
                    </p>
                    <div
                      className={[
                        'mt-auto pt-4 font-mono text-[10px] uppercase tracking-[0.22em]',
                        invert ? 'text-paper/45' : 'text-stone',
                      ].join(' ')}
                    >
                      — procedure {i}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
