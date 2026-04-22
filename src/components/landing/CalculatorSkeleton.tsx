export function CalculatorSkeleton() {
  return (
    <section
      aria-hidden
      className="relative px-5 sm:px-8 pt-20 pb-24 section-defer"
      style={{ contain: 'layout paint style', minHeight: 720 }}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-10">
          <div className="h-3 w-24 rounded-full bg-haze" />
          <div className="mt-4 h-16 w-2/3 rounded-2xl bg-haze" />
        </div>
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-7 rounded-3xl border border-hairline bg-paper p-8 sm:p-10">
            <div className="h-3 w-40 rounded-full bg-haze" />
            <div className="mt-6 h-24 w-full rounded-2xl bg-haze" />
            <div className="mt-6 h-2 w-full rounded-full bg-haze" />
            <div className="mt-10 grid grid-cols-3 gap-3">
              <div className="h-24 rounded-2xl bg-haze" />
              <div className="h-24 rounded-2xl bg-haze" />
              <div className="h-24 rounded-2xl bg-haze" />
            </div>
          </div>
          <div className="lg:col-span-5 rounded-3xl bg-ink/90 p-8 sm:p-10">
            <div className="h-3 w-32 rounded-full bg-paper/15" />
            <div className="mt-4 h-24 rounded-2xl bg-paper/10" />
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="h-12 rounded-xl bg-paper/10" />
              <div className="h-12 rounded-xl bg-paper/10" />
              <div className="h-12 rounded-xl bg-paper/10" />
              <div className="h-12 rounded-xl bg-paper/10" />
            </div>
            <div className="mt-10 h-16 rounded-2xl bg-paper/15" />
          </div>
        </div>
      </div>
    </section>
  )
}
