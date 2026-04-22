import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="border-t border-hairline px-5 sm:px-8 py-10">
      <div className="mx-auto w-full max-w-[1200px] grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 sm:col-span-4">
          <div className="font-display text-xl font-black tracking-tight">Protest Pilot</div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-stone">
            A Texas homeowner’s instrument · 2026
          </p>
        </div>
        <nav className="col-span-6 sm:col-span-4 font-mono text-[11px] uppercase tracking-[0.22em] text-stone">
          <ul className="space-y-1.5">
            <li>
              <Link href="#calculator" className="hover:text-ink">
                Calculator
              </Link>
            </li>
            <li>
              <Link href="#features" className="hover:text-ink">
                Platform
              </Link>
            </li>
            <li>
              <Link href="#process" className="hover:text-ink">
                Method
              </Link>
            </li>
          </ul>
        </nav>
        <div className="col-span-6 sm:col-span-4 font-mono text-[10px] uppercase tracking-[0.22em] text-stone sm:text-right">
          <div>Form 50-132 · TX Comptroller</div>
          <div>Not legal advice</div>
          <div>v 1.0.0 — 2026</div>
        </div>
      </div>
    </footer>
  )
}
