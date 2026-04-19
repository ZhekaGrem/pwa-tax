import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export const metadata = {
  title: 'Protest Pilot — Fight Your Texas Property Tax',
  description:
    'Generate a filled Form 50-132 Notice of Protest in minutes. Evidence-ready. Built for Texas homeowners.',
}

export default function Landing() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">Stop overpaying on property tax.</h1>
      <p className="text-lg text-slate-600">
        Protest Pilot walks you through filing your Texas Form 50-132 with comparable-sales evidence
        in under 5 minutes.
      </p>
      <div className="flex gap-3">
        <Link href="/sign-in" className={buttonVariants()}>
          Get started
        </Link>
        <Link href="#how" className={buttonVariants({ variant: 'outline' })}>
          How it works
        </Link>
      </div>
      <section id="how" className="grid gap-6 md:grid-cols-3 pt-12">
        <Feature
          title="1. Enter your property"
          body="Address, parcel ID, and assessment details from your HCAD notice."
        />
        <Feature
          title="2. Pick comparables"
          body="Select 3-5 nearby properties with lower assessed values as evidence."
        />
        <Feature
          title="3. Download your form"
          body="We fill Form 50-132 and generate a ready-to-file PDF."
        />
      </section>
    </main>
  )
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border p-6">
      <div className="font-semibold">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{body}</div>
    </div>
  )
}
