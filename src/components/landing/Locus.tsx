import Image from 'next/image'

export function Locus() {
  return (
    <section aria-label="Coverage" className="relative isolate overflow-hidden bg-ink text-paper">
      {/* Full-bleed topographic backdrop */}
      <Image
        src="/abstract-map-texas.png"
        alt="Abstract topographic rendering of Texas counties"
        fill
        sizes="100vw"
        className="-z-10 object-cover opacity-[0.34] mix-blend-screen"
        priority={false}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(90deg, var(--ink) 0%, color-mix(in oklch, var(--ink) 72%, transparent) 45%, color-mix(in oklch, var(--ink) 30%, transparent) 75%, transparent 100%)',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-paper/15" />

      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:flex-row lg:items-end">
        <div className="flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/55">
            locus · 254 counties · 9.1 M parcels
          </div>
          <h2 className="mt-4 font-display font-black tracking-ultra-tight leading-[0.88] text-balance text-[clamp(2.5rem,8vw,5.5rem)]">
            Every county,
            <br />
            every notice,
            <br />
            <span className="text-[var(--neon)] neon-glow">one instrument</span>.
          </h2>
        </div>

        <ul className="grid w-full max-w-md grid-cols-3 gap-px overflow-hidden rounded-xl border border-paper/15 bg-paper/10">
          {[
            { k: 'Harris · 201', v: '9.4%' },
            { k: 'Travis · 227', v: '8.1%' },
            { k: 'Dallas · 113', v: '8.8%' },
          ].map((c) => (
            <li key={c.k} className="relative bg-ink/70 p-5 backdrop-blur-sm">
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-paper/55">
                {c.k}
              </div>
              <div className="mt-3 font-display text-3xl font-black tracking-ultra-tight text-paper">
                {c.v}
              </div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-paper/45">
                avg · reduction
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
