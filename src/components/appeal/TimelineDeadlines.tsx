'use client'
import { useEffect, useState } from 'react'
import { TEXAS_TIMELINE, getCurrentPhase } from '@/data/timeline-texas'

export function TimelineDeadlines() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 24 * 60 * 60 * 1000)
    return () => clearInterval(t)
  }, [])
  const current = getCurrentPhase(now)
  const tone = { grey: 'bg-slate-100', yellow: 'bg-yellow-100 animate-pulse', blue: 'bg-blue-100' }
  return (
    <ol className="space-y-2">
      {TEXAS_TIMELINE.map((p) => (
        <li
          key={p.id}
          aria-current={p.id === current.id ? 'step' : undefined}
          className={`rounded border p-3 ${p.id === current.id ? tone[p.tone] : 'bg-white'}`}
        >
          <div className="font-medium">{p.label}</div>
          <div className="text-sm text-slate-600">{p.description}</div>
        </li>
      ))}
    </ol>
  )
}
