'use client'
import { useAppealStore } from '@/store/useAppealStore'
import { StepProperty } from '@/components/wizard/StepProperty'
import { StepAssessment } from '@/components/wizard/StepAssessment'
import { StepComps } from '@/components/wizard/StepComps'
import { StepReview } from '@/components/wizard/StepReview'

export default function NewAppealPage() {
  const step = useAppealStore((s) => s.step)
  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-500">Step {step + 1} of 4</div>
      {step === 0 && <StepProperty />}
      {step === 1 && <StepAssessment />}
      {step === 2 && <StepComps />}
      {step === 3 && <StepReview />}
    </div>
  )
}
