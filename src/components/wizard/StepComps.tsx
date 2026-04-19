'use client'
import { useState } from 'react'
import { useAppealStore } from '@/store/useAppealStore'
import { loadCompsForZip } from '@/services/comps'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Comp } from '@/schemas/appeal'

export function StepComps() {
  const { zip, setZip, selectedComps, toggleComp, nextStep, prevStep } = useAppealStore()
  const [comps, setComps] = useState<Comp[]>([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!/^\d{5}$/.test(zip)) {
      setErr('Enter a 5-digit ZIP')
      return
    }
    setErr('')
    setLoading(true)
    setComps(await loadCompsForZip(zip))
    setLoading(false)
  }

  const onNext = () => {
    if (selectedComps.length < 3) {
      setErr('Select at least 3 comparables')
      return
    }
    setErr('')
    nextStep()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Step 3: Select comparables</h2>
      <div className="flex items-end gap-2">
        <div className="space-y-1 flex-1">
          <Label htmlFor="zip">ZIP code</Label>
          <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} />
        </div>
        <Button type="button" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Load'}
        </Button>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <ul className="divide-y rounded border">
        {comps.map((c) => {
          const checked = !!selectedComps.find((x) => x.parcelId === c.parcelId)
          return (
            <li key={c.parcelId} className="flex items-center gap-3 p-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleComp(c)}
                aria-label={c.address}
              />
              <div className="flex-1">
                <div className="font-medium">{c.address}</div>
                <div className="text-sm text-slate-500">
                  ${c.assessedValue.toLocaleString()} · {c.sqft} sqft · {c.bedrooms}bd/{c.bathrooms}
                  ba · {c.yearBuilt}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  )
}
