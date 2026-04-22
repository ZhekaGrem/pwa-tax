const STATS = [
  { k: 'Avg. refund', v: '$3,842' },
  { k: 'HCAD reduction rate', v: '92%' },
  { k: 'Median time to file', v: '4m 12s' },
  { k: 'Appeals filed · 2025', v: '128,409' },
  { k: 'Lighthouse score', v: '100 / 100' },
  { k: 'Install size', v: '0.4 MB' },
]

const EDGE_FADE = 'linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%)'

export function StatStrip() {
  const loop = [...STATS, ...STATS]
  return (
    <section
      aria-label="Key metrics"
      className="relative border-y border-hairline bg-paper overflow-hidden"
      style={{
        WebkitMaskImage: EDGE_FADE,
        maskImage: EDGE_FADE,
      }}
    >
      <div
        className="flex w-max items-center gap-14 py-5 hover:[animation-play-state:paused]"
        style={{
          animation: 'marquee 28s linear infinite',
          willChange: 'transform',
        }}
      >
        {loop.map((s, i) => (
          <div key={i} className="flex shrink-0 items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-stone">
              {s.k}
            </span>
            <span className="font-display text-2xl font-black tracking-ultra-tight text-ink">
              {s.v}
            </span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-stone/40" />
          </div>
        ))}
      </div>
    </section>
  )
}
