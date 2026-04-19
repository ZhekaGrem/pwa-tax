'use client'
import { useMemo, useState } from 'react'
import { useAppealStore } from '@/store/useAppealStore'
import { computeSavings } from '@/lib/calculator'
import { SavingsBarChart } from '@/components/charts/SavingsBarChart'
import { ComparisonChart } from '@/components/charts/ComparisonChart'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { getFirebaseAuth } from '@/lib/firebase/client'

export function StepReview() {
  const { id, property, assessment, selectedComps, prevStep } = useAppealStore()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const calc = useMemo(() => {
    try {
      return computeSavings({
        property: { sqft: property.sqft ?? 0 },
        currentAssessedValue: assessment.currentAssessedValue ?? 0,
        comps: selectedComps,
        taxRate: assessment.taxRate ?? 0,
      })
    } catch {
      return null
    }
  }, [property, assessment, selectedComps])

  const onGenerate = async () => {
    if (!user || !id) {
      toast.error('Not ready')
      return
    }
    setLoading(true)
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken()
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appealId: id }),
      })
      if (!res.ok) throw new Error(`PDF generation failed (${res.status})`)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `appeal-${new Date().getFullYear()}.pdf`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (!calc) return <div>Not enough data for preview. Go back and complete earlier steps.</div>
  const currentTax = (assessment.currentAssessedValue ?? 0) * (assessment.taxRate ?? 0)
  const proposedTax = calc.proposedValue * (assessment.taxRate ?? 0)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Step 4: Review and generate</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded border p-4">
          <div className="text-sm text-slate-500">Proposed value</div>
          <div className="text-2xl font-bold">
            ${Math.round(calc.proposedValue).toLocaleString('en-US')}
          </div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-slate-500">Estimated savings</div>
          <div className="text-2xl font-bold text-green-600">
            ${Math.round(calc.taxSavingsUSD).toLocaleString('en-US')}
          </div>
        </div>
      </div>
      <SavingsBarChart currentTax={currentTax} proposedTax={proposedTax} />
      <ComparisonChart
        subjectPerSqft={(assessment.currentAssessedValue ?? 0) / (property.sqft ?? 1)}
        medianPerSqft={calc.medianCompValue / (property.sqft ?? 1)}
      />
      <div className="flex gap-2">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={onGenerate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate PDF'}
        </Button>
      </div>
    </div>
  )
}
