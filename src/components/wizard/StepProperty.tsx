'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PropertySchema, type Property } from '@/schemas/appeal'
import { useAppealStore } from '@/store/useAppealStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { createDraftAppeal } from '@/services/storage'

export function StepProperty() {
  const { property, patchProperty, nextStep } = useAppealStore()
  const { user } = useAuth()
  const form = useForm<Property>({
    resolver: zodResolver(PropertySchema),
    defaultValues: { county: 'Harris', ...property },
  })
  const onSubmit = async (v: Property) => {
    patchProperty(v)
    const state = useAppealStore.getState()
    if (user && !state.id) {
      try {
        const id = await createDraftAppeal(user.uid, {
          year: new Date().getFullYear(),
          property: v,
          assessment: state.assessment.taxRate
            ? { currentAssessedValue: 0, marketValue: 0, taxRate: state.assessment.taxRate }
            : { currentAssessedValue: 0, marketValue: 0, taxRate: 0.0231 },
          selectedComps: [],
        } as never)
        useAppealStore.getState().setId(id)
      } catch (e) {
        console.error('Failed to create draft', e)
        // Continue anyway — wizard still usable in offline mode (Firestore persistentLocalCache will retry)
      }
    }
    nextStep()
  }

  const field = (name: keyof Property, label: string, type = 'text') => (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={type} {...form.register(name, { valueAsNumber: type === 'number' })} />
      {form.formState.errors[name] && (
        <p className="text-sm text-red-600">{String(form.formState.errors[name]?.message)}</p>
      )}
    </div>
  )

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold">Step 1: Your property</h2>
      {field('address', 'Address')}
      {field('parcelId', 'Parcel ID')}
      {field('yearBuilt', 'Year built', 'number')}
      {field('sqft', 'Sqft', 'number')}
      {field('bedrooms', 'Bedrooms', 'number')}
      {field('bathrooms', 'Bathrooms', 'number')}
      {field('lotSizeSqft', 'Lot size', 'number')}
      <Button type="submit">Next</Button>
    </form>
  )
}
