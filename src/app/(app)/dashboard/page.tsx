'use client'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { TimelineDeadlines } from '@/components/appeal/TimelineDeadlines'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your appeal</h1>
        <Link href="/appeal/new" className={buttonVariants()}>
          Start new appeal
        </Link>
      </div>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Texas appeal timeline</h2>
        <TimelineDeadlines />
      </section>
    </div>
  )
}
