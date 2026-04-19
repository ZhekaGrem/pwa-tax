'use client'
import { Button } from '@/components/ui/button'

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-slate-600">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  )
}
