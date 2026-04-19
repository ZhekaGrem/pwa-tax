'use client'
import { useAppealStore } from '@/store/useAppealStore'
import { StepProperty } from '@/components/wizard/StepProperty'
import { StepAssessment } from '@/components/wizard/StepAssessment'

export default function NewAppealPage() {
  const step = useAppealStore((s) => s.step)
  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-500">Step {step + 1} of 4</div>
      {step === 0 && <StepProperty />}
      {step === 1 && <StepAssessment />}
      {step === 2 && <div>Step 3 coming next task</div>}
      {step === 3 && <div>Step 4 coming next task</div>}
    </div>
  )
}
