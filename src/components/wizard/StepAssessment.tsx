'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AssessmentSchema, type Assessment } from '@/schemas/appeal'
import { useAppealStore } from '@/store/useAppealStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function StepAssessment() {
  const { assessment, patchAssessment, nextStep, prevStep } = useAppealStore()
  const form = useForm<Assessment>({
    resolver: zodResolver(AssessmentSchema),
    defaultValues: { taxRate: 0.0231, ...assessment },
  })
  const onSubmit = (v: Assessment) => {
    patchAssessment(v)
    nextStep()
  }

  const field = (name: keyof Assessment, label: string, step = 'any') => (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type="number"
        step={step}
        {...form.register(name, { valueAsNumber: true })}
      />
      {form.formState.errors[name] && (
        <p className="text-sm text-red-600">{String(form.formState.errors[name]?.message)}</p>
      )}
    </div>
  )

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold">Step 2: Current assessment</h2>
      {field('currentAssessedValue', 'Current assessed value (USD)')}
      {field('marketValue', 'Market value (USD)')}
      {field('taxRate', 'Tax rate (e.g. 0.0231)', '0.0001')}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  )
}
